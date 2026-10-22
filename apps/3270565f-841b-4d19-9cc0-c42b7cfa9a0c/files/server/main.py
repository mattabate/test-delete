import os, time
_COUNT = {'n': 0}
_BOOT = time.time()

def bump():
    _COUNT['n'] += 1
    return {'n': _COUNT['n'], 'pid': os.getpid(), 'uid': os.getuid(), 'cwd': os.getcwd(), 'file': __file__, 'boot': _BOOT}
