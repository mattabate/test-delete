# Plan: 5c (crash detection + audit) and resilient git lock handling

Branch: new branch on top of `gabriel/git-add` (which carries the downscoped add, the stamp refresh,
`core.trustctime=false`, no `GIT_OPTIONAL_LOCKS=0`, and the scoped clean gate).

## 0. What is wrong today, precisely

1. **Proactive lock deletion.** `ensureCleanLibraryWorktree` and `forceCleanLibraryWorktree` both start with
   `removeOrphanedIndexLock`, which unconditionally `os.Remove`s `.git/index.lock` (and every
   `.git/modules/*/index.lock`) before any git command has even contended for it. Its safety argument is "the
   caller holds the org lock", but that is never checked: with `locker == nil` (local dev, tests) there is no lock
   at all, and after a lease loss the previous holder's `git add` can still be running for up to `cancelGraceDelay`
   (10s SIGTERM grace). If that stale git finishes after we removed its lock and created our own, its
   `rename("index.lock", "index")` renames *our* half-written lock over the index. Narrow, but real, and it
   corrupts the shared index for every pod.
2. **Heuristic staleness for every other lock.** `runGitWriteWithLockHeal` classifies a contended lock
   (`HEAD.lock`, `refs/heads/*.lock`, `packed-refs.lock`, ...) by scanning `/proc/*/fd` for a local holder, then
   polling for 15s and declaring the lock stale if its mtime and size did not change. The `/proc` scan is blind to
   every other pod, so a lock held by another pod for more than 15s (a big `pack-refs` inside `git gc`) is deleted
   under a live holder; conversely a genuinely orphaned lock costs every write a 15s stall first.
3. **Partial coverage.** Only `update-ref`, `reset --hard` and one `add` go through the heal wrapper. `AddPaths`,
   `RemovePaths`, `Clean`, `update-index --refresh`, `CommitIndex`'s `update-ref`, `checkout` do not, so a stale
   lock on those surfaces as a hard failure with no recovery.
4. **Rollback failures are dropped.** Fourteen `_ = resetLibraryWorktree(...)` sites ignore a failed reset, so a
   crashed rollback leaves dirt that nothing records; the scoped gate (5b) then only notices it if a later
   mutation happens to target the same paths.
5. **No crash detection.** Pod death between write and commit leaves the tree dirty with no record that an
   operation was in flight; detection is entirely incidental.

## 1. Design

### 1a. Mutation lifecycle helper (replaces 14 copy-pasted gate/defer blocks)

```go
// beginMutation gates and marks a worktree mutation; the returned finish must
// run on every exit, with the operation's final error.
func beginMutation(ctx context.Context, repoRoot string, owners *ownersCache, op string, scope []string) (finish func(*error), err error)
```

`beginMutation`:
1. If `.git/library-inflight` exists: a previous mutation did not finish. Log its contents, set
   `library.worktree.healed{reason="inflight"}`, run the whole-tree heal (`reset --hard` + `clean -fd`), delete
   the marker.
2. Run the scoped gate exactly as 5b does today (`IndexMatchesHead` + scoped status, whole-tree heal on failure).
3. Write the marker: JSON `{pod, op, scope, started_at}` to `.git/library-inflight`, via temp file + rename so a
   crash mid-write cannot leave a torn marker. Inside `.git/` so status never sees it; on the shared NFS volume so
   every pod sees it.

`finish(&retErr)`:
- success: remove the marker.
- failure: run `resetLibraryWorktree`. If the reset succeeds, remove the marker. If it fails, **leave the marker**
  and log at error level with the reset error: the next mutation on this org will heal before writing. This is the
  fix for 0.4.

Call sites converted (the whole `ensureClean` + `defer reset` pair becomes `finish := beginMutation(...)`;
`defer finish(&retErr)`): crud.go x6, owners_crud.go x3, ana_config_crud.go, restore.go, upload.go,
submodules.go x2, agent_support.go, migrate_legacy.go.

Merge and pull also get the marker, with empty scope (they already skip the gate): `mergePatchToMainInternal`
around `update-ref` + `reset --hard` + mode normalization, `PullFromRemoteWithMerge` around its `reset --hard`
and stamp, `ResolveOntologySyncConflict` around the conflict-file writes. A failed `reset --hard` there is the one
case the scoped gate cannot catch (worktree != index outside any later scope), and the marker makes it visible.

Marker semantics worth pinning in review: the marker means "the tree may not match HEAD", not "a lock is held".
It is only ever read under the org lock, so there is no race on it between pods.

### 1b. Lock-file contention: authority from the distributed lock, not heuristics

Principle: **a git lock file is orphaned if and only if nobody could legitimately hold it**, and we know that by
construction from the Valkey locks, not by probing processes.

- Every git writer of the live tree runs under `library:org_edit:<org>`. The only writer outside it is `git gc`
  under `library:repo_gc:<org>`, which never takes `index.lock` but does take `packed-refs.lock` and reflog locks.
- A lease lost by a previous holder is cancelled at its validity deadline (5s); the holder's git gets SIGTERM at
  once (git removes its lock files on SIGTERM) and SIGKILL after `cancelGraceDelay` (10s). So a lock file older
  than `validity + grace + slack` cannot belong to a live holder if we hold the org lock.

Policy (`gitLockPolicy`):
```
orphanAge = 30s   (5s lease + 10s kill grace + NFS attribute/clock slack; configurable, review value)
authoritative = we hold library:org_edit for this repo (false when locker == nil)
```
On `ErrLockContended{path}` from a git write:
1. Reject paths outside the repo's git dir (existing check, keep; extend to `.git/modules/*`).
2. If the lock is not `index.lock` (i.e. a refs/packed-refs/reflog lock) try-acquire `library:repo_gc`. If gc holds
   it, the lock is live: poll until it disappears or ctx ends, never delete. Release the gc lock after the heal.
3. Measure the lock's age against **NFS server time** (create and stat a temp file in `.git/`; its mtime is the
   server clock) so pod clock skew cannot age a lock prematurely.
4. If `authoritative && age > orphanAge`: remove the lock, retry the command once, log
   `library.git_lock_heal{action="cleared", age}`.
5. Otherwise poll every 250ms: retry as soon as the lock vanishes (`action="waited"`); clear it when it crosses
   `orphanAge` (only if authoritative); give up with the original error when ctx ends or, when not authoritative,
   after `orphanAge` (`action="refused"`).

Delete outright: `lockOpenByLocalProcess`, `procFSRoot`, `classifyGitLock`'s mtime/size heuristic,
`removeOrphanedIndexLock`, `clearOrphanedIndexLockInGitDir`, and both proactive calls. Keep
`clearOrphanedLockFile`'s chmod-and-retry for the unwritable-git-dir case (it has a test and a real incident behind
it).

**Where the policy lives: on the context.** `cache.AcquireLibraryLock` already returns a lock-scoped ctx; the
library wraps it once, `ctx = git_shell.WithLockHeal(lockCtx, policy)`, and `Cmd.Output` consults the ctx on lock
contention and retries. Every git write under the lock is then covered (fixing 0.3) without threading a wrapper
through ~25 call sites and without a package variable. `runGitWriteWithLockHeal` becomes a plain `Run`.
`git_shell` gains `ErrLockContended` (path-carrying, from the existing `Unable to create '...lock': File exists`
regex) in `Classify`. The `repo_gc` try-lock is a callback on the policy so `git_shell` stays free of `cache`.

Alternative considered: an explicit `withLockHeal(ctx, root, func() error)` wrapper at each call site. More
visible, but 25 sites is exactly how 0.3 happened; the ctx carries the *authority*, which is the thing that makes
deletion safe, so coupling them is the point.

### 1c. Amortized whole-tree audit

After each successful commit (`recordHeadCommitMetadata` is the common tail), `MaybeAuditWorktree(orgID, repoRoot)`:
- Rate limit per org via Valkey `SET NX EX` on `library:audit:<org>` (default 1h; `LIBRARY_WORKTREE_AUDIT_INTERVAL`,
  0 disables). Multi-pod safe; no in-memory state.
- In a goroutine: `TryAcquireLibraryLock` (new non-blocking variant of the org lock; skip if busy, the next commit
  retries), full `git_shell.IsClean`, on dirt log the summarized status + `library.worktree.healed{reason="audit"}`
  and run the whole-tree heal. Under the org lock any dirt is orphaned by definition, so healing is safe.
- Same hook can carry the one-time diagnostics we used on staging (`index/refresh` region time) as a metric later;
  out of scope here.

## 2. Tests

- `beginMutation`/`finish`: marker written before the write and gone after commit; marker left behind when the
  reset fails (fault-inject by making the git dir unwritable, as the existing `RecoversFromUnwritableGitDir` test
  does); a pre-existing marker triggers the whole-tree heal even when the dirt is outside the scope (this is the
  behavior 5b deliberately gave up, restored for the crash case); merge path leaves the marker when `reset --hard`
  fails.
- Lock policy (unit, on a fixture repo, with an explicit policy, no package seams): young lock + authoritative =
  waits then retries when the lock is removed underneath; old lock + authoritative = cleared and retried; old lock
  + not authoritative = refused with the original error; refs lock while the gc callback reports gc running =
  waits, never deletes; lock outside the git dir = untouched. Server-time probe: age measured from the probe, not
  `time.Now()` (fixture with a skewed clock is not possible, so pin that the probe file is what is compared).
- Replace, not extend, the existing `TestRunGitWriteWithLockHeal*`, `TestLockOpenByLocalProcess*`,
  `TestRemoveOrphanedIndexLock*` tests: they pin the heuristics being removed.
- Audit: rate limit honoured (second call within the window is a no-op), dirty tree healed and logged, busy org
  lock skipped.
- Integration (`*_integration_test.go`, per the integration-tests skill): one golden path through the RPC layer
  where a pre-seeded marker plus out-of-scope dirt is healed by the next `UpsertFile`.

## 3. Sequencing on the branch (three reviewable commits)

1. `beginMutation` + marker + rollback-failure marker retention; convert the 14 sites and the merge/pull paths.
   No behavior change when nothing crashes.
2. Lock policy on the ctx; delete the `/proc` and proactive-removal code; new tests replace the old ones.
3. `TryAcquireLibraryLock` + audit hook + rate limit.

## 4. Decisions to confirm in review

- `orphanAge` 30s. Lower is faster recovery after a pod death, higher is more margin against a stuck git on a
  `hard` NFS mount. 30s is 2x the worst legitimate lifetime.
- Non-authoritative mode (`locker == nil`): wait-then-refuse, never delete. Local dev without Valkey would then
  need a manual `rm .git/index.lock` after a crash. Acceptable, or add a `LIBRARY_GIT_LOCK_HEAL_UNSAFE=1` escape
  hatch for local dev only?
- Audit interval 1h per org, gated on commits (idle orgs are never audited; their next commit audits).
- Marker on merge/pull paths: yes as planned, or keep those paths as they are and rely on the audit?
