/*
Copyright (c) 2018-2020 Uber Technologies, Inc.

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
// @flow
import * as React from 'react';
import StatefulContainer from './stateful-container.js';
import Datepicker from './datepicker.js';
import type {
  StatefulDatepickerPropsT,
  DatepickerPropsT,
  StateReducerT,
} from './types.js';

class StatefulComponent<T = Date> extends React.Component<
  StatefulDatepickerPropsT<DatepickerPropsT<T>>,
> {
  static defaultProps: {stateReducer: StateReducerT<T>} = {
    initialState: {},
    stateReducer: (type, nextState) => nextState,
    onChange: () => {},
  };
  render() {
    return (
      <StatefulContainer {...this.props}>
        {extendedProps => <Datepicker {...extendedProps} />}
      </StatefulContainer>
    );
  }
}

export default StatefulComponent;
