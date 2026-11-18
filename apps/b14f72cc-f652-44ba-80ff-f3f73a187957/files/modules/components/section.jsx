import { Component } from "react";
import { Callout } from "tremor";

export class Section extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    return this.state.error ? (
      <Callout title="This section could not load">{String(this.state.error.message || this.state.error)}</Callout>
    ) : (
      this.props.children
    );
  }
}
