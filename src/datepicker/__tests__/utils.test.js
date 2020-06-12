/*
Copyright (c) 2018-2020 Uber Technologies, Inc.

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
// @flow
/* eslint-disable import/extensions */
import {es} from 'date-fns/locale/index.js';
import * as utilsHelpers from '../utils/index';
import DateHelpers from '../utils/date-helpers';
import adapter from '../utils/date-fns-adapter';
/* eslint-enable import/extensions */
const dateHelpers = new DateHelpers(adapter);

//$FlowFixMe
const helpers: DateHelpers<Date> = Object.keys(dateHelpers).reduce(
  (memo, methodName) => {
    return {
      ...memo,
      [methodName]: (...args) => {
        //$FlowFixMe
        const dateHelpersReturn = dateHelpers[methodName](...args);
        //$FlowFixMe
        if (!utilsHelpers[methodName]) {
          return dateHelpersReturn;
        }
        const utilsHelpersReturn = utilsHelpers[methodName](...args);
        const getComparisonValue = value => {
          if (value instanceof Date) {
            return value.toISOString();
          }
          return value;
        };
        if (
          getComparisonValue(utilsHelpersReturn) !==
          getComparisonValue(dateHelpersReturn)
        ) {
          console.log(dateHelpersReturn, utilsHelpersReturn);
          throw new Error(
            'utils/index method and dateHelpers method return different values',
          );
        }
        return dateHelpersReturn;
      },
    };
  },
  {},
);

const MIDNIGHT = new Date(2019, 3, 19);
describe('Datepicker utils', () => {
  describe('differenceInCalendarMonths', () => {
    test('should return the difference in calendar months', () => {
      expect(
        helpers.differenceInCalendarMonths(
          new Date(2020, 5, 1),
          new Date(2020, 6, 1),
        ),
      ).toEqual(-1);
      expect(
        helpers.differenceInCalendarMonths(
          new Date(2020, 5, 1),
          new Date(2020, 4, 1),
        ),
      ).toEqual(1);
      expect(
        helpers.differenceInCalendarMonths(
          new Date(2020, 5, 1),
          new Date(2020, 5, 10),
        ),
      ).toEqual(0);
    });
  });
  describe('differenceInCalendarDays', () => {
    test('should return different in calendar days', () => {
      expect(
        helpers.differenceInCalendarDays(
          new Date(2020, 5, 2),
          new Date(2020, 5, 3),
        ),
      ).toEqual(-1);
      expect(
        helpers.differenceInCalendarDays(
          new Date(2020, 5, 2),
          new Date(2020, 5, 1),
        ),
      ).toEqual(1);
      expect(
        helpers.differenceInCalendarDays(
          new Date(2020, 5, 1),
          new Date(2020, 5, 1),
        ),
      ).toEqual(0);
    });
  });
  describe('format', () => {
    test('should format date', () => {
      expect(helpers.formatDate(MIDNIGHT, 'yyyy-MM-dd')).toEqual('2019-04-19');
    });
    test('should apply locale to format if provided', () => {
      expect(helpers.formatDate(MIDNIGHT, 'MMM', es)).toEqual('abr');
    });
  });
  describe('isSameYear', () => {
    test('should show if dates are same year', () => {
      expect(
        helpers.isSameYear(new Date(2019, 1, 1), new Date(2020, 1, 1)),
      ).toEqual(false);
      expect(
        helpers.isSameYear(new Date(2019, 1, 1), new Date(2019, 2, 1)),
      ).toEqual(true);
    });
    test('should return false if either date is falsy', () => {
      expect(helpers.isSameYear(null, MIDNIGHT)).toEqual(false);
      expect(helpers.isSameYear(MIDNIGHT, null)).toEqual(false);
    });
  });
  describe('isSameMonth', () => {
    test('should show if dates are same month', () => {
      expect(
        helpers.isSameMonth(new Date(2019, 1, 1), new Date(2019, 2, 1)),
      ).toEqual(false);
      expect(
        helpers.isSameMonth(new Date(2019, 1, 1), new Date(2019, 1, 2)),
      ).toEqual(true);
    });
    test('should return false if either date is falsy', () => {
      expect(helpers.isSameMonth(null, MIDNIGHT)).toEqual(false);
      expect(helpers.isSameMonth(MIDNIGHT, null)).toEqual(false);
    });
  });
  describe('isSameDay', () => {
    test('should show if dates are same day', () => {
      expect(
        helpers.isSameDay(new Date(2019, 1, 1), new Date(2019, 1, 2)),
      ).toEqual(false);
      expect(
        helpers.isSameDay(new Date(2019, 1, 1), new Date(2019, 1, 1)),
      ).toEqual(true);
    });
    test('should return false if either date is falsy', () => {
      expect(helpers.isSameDay(null, MIDNIGHT)).toEqual(false);
      expect(helpers.isSameDay(MIDNIGHT, null)).toEqual(false);
    });
  });
  describe('isStartOfMonth', () => {
    test('should show if date is start of month', () => {
      expect(helpers.isStartOfMonth(new Date(2019, 1, 2))).toEqual(false);
      expect(helpers.isStartOfMonth(new Date(2019, 1, 1))).toEqual(true);
    });
  });
  describe('isEndOfMonth', () => {
    test('should show if date is end of month', () => {
      expect(helpers.isEndOfMonth(new Date(2020, 0, 30))).toEqual(false);
      expect(helpers.isEndOfMonth(new Date(2020, 0, 31))).toEqual(true);
    });
  });
  describe('getWeekdayMinInLocale', () => {
    test('should get the first letter of the weekday in the provided locale', () => {
      expect(helpers.getWeekdayMinInLocale(new Date(2020, 0, 1), es)).toEqual(
        'm',
      );
    });
  });
  describe('getWeekdayInLocale', () => {
    test('should get the weekday name in the provided locale', () => {
      expect(helpers.getWeekdayInLocale(new Date(2020, 0, 1), es)).toEqual(
        'miércoles',
      );
    });
  });
  describe('getMonthInLocale', () => {
    test('should get the name of the provided month number in the provided locale', () => {
      expect(helpers.getMonthInLocale(0, es)).toEqual('enero');
    });
  });
  describe('isOutOfBounds', () => {
    const minDate = new Date(2020, 0, 2);
    const maxDate = new Date(2020, 0, 4);
    describe('if both minDate and maxDate are provided', () => {
      test('should show if the date is above the max or below the min', () => {
        expect(
          helpers.isOutOfBounds(new Date(2020, 0, 3), {
            minDate,
            maxDate,
          }),
        ).toEqual(false);
        expect(
          helpers.isOutOfBounds(new Date(2020, 0, 5), {
            minDate,
            maxDate,
          }),
        ).toEqual(true);
        expect(
          helpers.isOutOfBounds(new Date(2020, 0, 1), {
            minDate,
            maxDate,
          }),
        ).toEqual(true);
      });
    });
  });
  describe('isDayDisabled', () => {
    const minDate = new Date(2020, 0, 2);
    const maxDate = new Date(2020, 0, 4);
    describe('if maxDate and minDate are provided', () => {
      test('should return true if the date is outside of the max and min', () => {
        expect(
          helpers.isDayDisabled(new Date(2020, 0, 5), {
            minDate,
            maxDate,
            excludeDates: undefined,
            includeDates: undefined,
            filterDate: undefined,
          }),
        ).toEqual(true);
        expect(
          helpers.isDayDisabled(new Date(2020, 0, 3), {
            minDate,
            maxDate,
            excludeDates: undefined,
            includeDates: undefined,
            filterDate: undefined,
          }),
        ).toEqual(false);
      });
    });
    describe('if excludedDates is provided', () => {
      test('should return true if the date is in excludedDates', () => {
        expect(
          helpers.isDayDisabled(new Date(2020, 0, 3), {
            minDate: undefined,
            maxDate: undefined,
            excludeDates: [new Date(2020, 0, 3)],
            includeDates: undefined,
            filterDate: undefined,
          }),
        ).toEqual(true);
        expect(
          helpers.isDayDisabled(new Date(2020, 0, 4), {
            minDate: undefined,
            maxDate: undefined,
            excludeDates: [new Date(2020, 0, 3)],
            includeDates: undefined,
            filterDate: undefined,
          }),
        ).toEqual(false);
      });
    });
    describe('if includedDates is provided', () => {
      test('should return true if the date is not in includedDates', () => {
        expect(
          helpers.isDayDisabled(new Date(2020, 0, 3), {
            minDate: undefined,
            maxDate: undefined,
            excludeDates: undefined,
            includeDates: [new Date(2020, 0, 4)],
            filterDate: undefined,
          }),
        ).toEqual(true);
        expect(
          helpers.isDayDisabled(new Date(2020, 0, 3), {
            minDate: undefined,
            maxDate: undefined,
            excludeDates: undefined,
            includeDates: [new Date(2020, 0, 3)],
            filterDate: undefined,
          }),
        ).toEqual(false);
      });
    });
    describe('if filterDate is provided', () => {
      test('should return true if filterDate returns false', () => {
        expect(
          helpers.isDayDisabled(new Date(2020, 0, 3), {
            minDate: undefined,
            maxDate: undefined,
            excludeDates: undefined,
            includeDates: undefined,
            filterDate: date => {
              return date.getFullYear() === 2019;
            },
          }),
        ).toEqual(true);
        expect(
          helpers.isDayDisabled(new Date(2020, 0, 3), {
            minDate: undefined,
            maxDate: undefined,
            excludeDates: undefined,
            includeDates: undefined,
            filterDate: date => date.getFullYear() === 2020,
          }),
        ).toEqual(false);
      });
    });
  });
  describe('monthDisabledBefore', () => {
    describe('if minDate is provided', () => {
      test('should return true if the minDate falls on a later month than one month before the provided date', () => {
        expect(
          helpers.monthDisabledBefore(new Date(2020, 4, 25), {
            minDate: new Date(2020, 4, 1),
            includeDates: undefined,
          }),
        ).toEqual(true);
        expect(
          helpers.monthDisabledBefore(new Date(2020, 4, 25), {
            minDate: new Date(2020, 3, 25),
            includeDates: undefined,
          }),
        ).toEqual(false);
        expect(
          helpers.monthDisabledBefore(new Date(2020, 4, 25), {
            minDate: new Date(2020, 3, 26),
            includeDates: undefined,
          }),
        ).toEqual(false);
      });
    });
    describe('if includeDates is provided', () => {
      test('should return true if every date in includeDates falls on later month than one month before the provided date', () => {
        expect(
          helpers.monthDisabledBefore(new Date(2020, 4, 25), {
            minDate: undefined,
            includeDates: [new Date(2020, 4, 1), new Date(2020, 4, 2)],
          }),
        ).toEqual(true);
        expect(
          helpers.monthDisabledBefore(new Date(2020, 4, 25), {
            minDate: undefined,
            includeDates: [new Date(2020, 4, 1), new Date(2020, 3, 25)],
          }),
        ).toEqual(false);
      });
    });
  });
});
describe('monthDisabledAfter', () => {
  describe('if maxDate is provided', () => {
    test('should return true if the maxDate falls on a earlier month than one month after the provided date', () => {
      expect(
        helpers.monthDisabledAfter(new Date(2020, 4, 25), {
          maxDate: new Date(2020, 4, 30),
          includeDates: undefined,
        }),
      ).toEqual(true);
      expect(
        helpers.monthDisabledAfter(new Date(2020, 4, 25), {
          maxDate: new Date(2020, 5, 1),
          includeDates: undefined,
        }),
      ).toEqual(false);
      expect(
        helpers.monthDisabledAfter(new Date(2020, 4, 25), {
          maxDate: new Date(2020, 5, 25),
          includeDates: undefined,
        }),
      ).toEqual(false);
    });
  });
  describe('if includeDates is provided', () => {
    test('should return true if every date in includeDates falls on a earlier month than one month after the provided date', () => {
      expect(
        helpers.monthDisabledAfter(new Date(2020, 4, 25), {
          maxDate: undefined,
          includeDates: [new Date(2020, 4, 29), new Date(2020, 4, 30)],
        }),
      ).toEqual(true);
      expect(
        helpers.monthDisabledAfter(new Date(2020, 4, 25), {
          maxDate: undefined,
          includeDates: [new Date(2020, 5, 1), new Date(2020, 4, 30)],
        }),
      ).toEqual(false);
    });
  });
});
describe('getEffectiveMinDate', () => {
  const includeDates = [
    new Date(2020, 0, 1),
    new Date(2020, 0, 2),
    new Date(2020, 0, 3),
  ];
  describe('if only minDate is provider', () => {
    test('should return minDate', () => {
      const minDate = new Date(2020, 4, 25);
      expect(helpers.getEffectiveMinDate({minDate})).toEqual(minDate);
    });
  });
  describe('if only includeDates is provided', () => {
    test('should return the earliest includeDate', () => {
      expect(helpers.getEffectiveMinDate({includeDates})).toEqual(
        includeDates[0],
      );
    });
  });
  describe('if minDate and includeDates are provided', () => {
    test('should return the earliest includeDate thats on or before the minDate', () => {
      expect(
        helpers.getEffectiveMinDate({
          includeDates,
          minDate: new Date(2020, 0, 2),
        }),
      ).toEqual(includeDates[1]);
    });
  });
});

describe('getEffectiveMaxDate', () => {
  const includeDates = [
    new Date(2020, 0, 1),
    new Date(2020, 0, 2),
    new Date(2020, 0, 3),
  ];
  describe('if only maxDate is provider', () => {
    test('should return maxDate', () => {
      const maxDate = new Date(2020, 4, 25);
      expect(helpers.getEffectiveMaxDate({maxDate})).toEqual(maxDate);
    });
  });
  describe('if only includeDates is provided', () => {
    test('should return the earliest includeDate', () => {
      expect(helpers.getEffectiveMaxDate({includeDates})).toEqual(
        includeDates[2],
      );
    });
  });
  describe('if maxDate and includeDates are provided', () => {
    test('should return the earliest includeDate thats on or after the maxDate', () => {
      expect(
        helpers.getEffectiveMaxDate({
          includeDates,
          maxDate: new Date(2020, 0, 2),
        }),
      ).toEqual(includeDates[1]);
    });
  });
});

describe('applyTimeToDate', () => {
  const time = new Date(2020, 1, 1, 10, 10);
  const date = new Date(2000, 2, 2, 5, 5, 5);
  describe('if date is not provided', () => {
    test('should return the time', () => {
      expect(helpers.applyTimeToDate(null, time)).toEqual(time);
    });
  });
  describe('if date is provided', () => {
    test('should apply the hours and minutes of the time to the date, and set the seconds to zero', () => {
      expect(helpers.applyTimeToDate(date, time).toISOString()).toEqual(
        '2000-03-02T16:10:00.000Z',
      );
    });
  });
});

describe('applyDateToTime', () => {
  const time = new Date(2020, 1, 1, 10, 10, 10);
  const date = new Date(2000, 2, 2, 5, 5, 5);
  describe('if date is not provided', () => {
    test('should return the time', () => {
      expect(helpers.applyDateToTime(null, date)).toEqual(date);
    });
  });
  describe('if date is provided', () => {
    test('should apply the year, month, and day of the date to the time', () => {
      expect(helpers.applyDateToTime(time, date).toISOString()).toEqual(
        '2000-03-02T16:10:10.000Z',
      );
    });
  });
});

describe('min', () => {
  test('should return the earliest date in the provided array', () => {
    const dates = [
      new Date(2020, 0, 3),
      new Date(2020, 0, 2),
      new Date(2020, 0, 1),
    ];
    expect(helpers.min(dates)).toEqual(dates[2]);
  });
});
describe('max', () => {
  test('should return the latest date in the provided array', () => {
    const dates = [
      new Date(2020, 0, 3),
      new Date(2020, 0, 2),
      new Date(2020, 0, 1),
    ];
    expect(helpers.max(dates)).toEqual(dates[0]);
  });
});
describe('setDate', () => {
  test('should set the provided day number on the provided date', () => {
    expect(helpers.setDate(new Date(2020, 0, 1), 10)).toEqual(
      new Date(2020, 0, 10),
    );
    expect(helpers.setDate(new Date(2020, 0, 1), 0)).toEqual(
      new Date(2019, 11, 31),
    );
    expect(helpers.setDate(new Date(2020, 0, 1), 32)).toEqual(
      new Date(2020, 1, 1),
    );
  });
});
describe('getDay', () => {
  test('should return the weekday number for the provided date', () => {
    // March 29th, 2020 is a Sunday
    expect(helpers.getDay(new Date(2020, 2, 29))).toEqual(0);
    expect(helpers.getDay(new Date(2020, 3, 2))).toEqual(4);
    expect(helpers.getDay(new Date(2020, 3, 4))).toEqual(6);
  });
});
describe('getDate', () => {
  test('should return the day of month number for the provided date', () => {
    expect(helpers.getDate(new Date(2020, 0, 1))).toEqual(1);
    expect(helpers.getDate(new Date(2020, 0, 20))).toEqual(20);
  });
});
describe('addWeeks', () => {
  test('should add the provided number of weeks to the provided date', () => {
    expect(helpers.addWeeks(new Date(2020, 0, 1), 2)).toEqual(
      new Date(2020, 0, 15),
    );
  });
});
describe('subWeeks', () => {
  test('should add the provided number of weeks to the provided date', () => {
    expect(helpers.subWeeks(new Date(2020, 0, 15), 2)).toEqual(
      new Date(2020, 0, 1),
    );
  });
});
describe('addYears', () => {
  test('should add the provided number of years to the provided date', () => {
    expect(helpers.addYears(new Date(2020, 0, 1), 1)).toEqual(
      new Date(2021, 0, 1),
    );
  });
});
describe('subYears', () => {
  test('should add the provided number of years to the provided date', () => {
    expect(helpers.subYears(new Date(2021, 0, 1), 1)).toEqual(
      new Date(2020, 0, 1),
    );
  });
});
describe('subDays', () => {
  test('should subtract the provided days from the provided date', () => {
    expect(helpers.subDays(new Date(2020, 0, 10), 5)).toEqual(
      new Date(2020, 0, 5),
    );
  });
});
describe('isDayInRange', () => {
  test('should return true if the provided is between the start date and end date', () => {
    expect(
      helpers.isDayInRange(
        new Date(2020, 0, 5),
        new Date(2020, 0, 4),
        new Date(2020, 0, 6),
      ),
    ).toEqual(true);
    expect(
      helpers.isDayInRange(
        new Date(2020, 0, 4),
        new Date(2020, 0, 4),
        new Date(2020, 0, 6),
      ),
    ).toEqual(true);
    expect(
      helpers.isDayInRange(
        new Date(2020, 0, 6),
        new Date(2020, 0, 5),
        new Date(2020, 0, 6),
      ),
    ).toEqual(true);
    expect(
      helpers.isDayInRange(
        new Date(2020, 0, 7),
        new Date(2020, 0, 4),
        new Date(2020, 0, 6),
      ),
    ).toEqual(false);
  });
});
describe('getStartOfWeek', () => {
  describe('if a locale is provided', () => {
    test('should return the start of the week in the provided locale', () => {
      expect(helpers.getStartOfWeek(new Date(2020, 3, 15), es)).toEqual(
        new Date(2020, 3, 13),
      );
    });
  });
  describe('if a locale is not provided', () => {
    test('should return the start of the week', () => {
      expect(helpers.getStartOfWeek(new Date(2020, 3, 15))).toEqual(
        new Date(2020, 3, 12),
      );
    });
  });
});
describe('getEndOfWeek', () => {
  test('should return the end of the week', () => {
    expect(helpers.getEndOfWeek(new Date(2020, 3, 15))).toEqual(
      new Date('2020-04-19T04:59:59.999Z'),
    );
  });
});
describe('setSeconds', () => {
  test('should set the seconds', () => {
    expect(utilsHelpers.setSeconds(new Date(2020, 0, 1), 5)).toEqual(
      new Date(2020, 0, 1, 0, 0, 5),
    );
  });
});
describe('setMinutes', () => {
  test('should set the minutes', () => {
    expect(utilsHelpers.setMinutes(new Date(2020, 0, 1), 5)).toEqual(
      new Date(2020, 0, 1, 0, 5, 0),
    );
  });
});
describe('setHours', () => {
  test('should set the hours', () => {
    expect(utilsHelpers.setHours(new Date(2020, 0, 1), 5)).toEqual(
      new Date(2020, 0, 1, 5, 0, 0),
    );
  });
});
describe('setMonth', () => {
  test('should set the month', () => {
    expect(utilsHelpers.setMonth(new Date(2020, 0, 1), 4)).toEqual(
      new Date(2020, 4, 1, 0, 0, 0),
    );
  });
});
describe('setYear', () => {
  test('should set the year', () => {
    expect(utilsHelpers.setYear(new Date(2020, 0, 1), 2021)).toEqual(
      new Date(2021, 0, 1),
    );
  });
});
describe('getMinutes', () => {
  test('should get the minutes', () => {
    expect(utilsHelpers.getMinutes(new Date(2020, 0, 1, 0, 5))).toEqual(5);
  });
});
describe('getHours', () => {
  test('should get the hours', () => {
    expect(utilsHelpers.getHours(new Date(2020, 0, 1, 5))).toEqual(5);
  });
});
describe('getMonth', () => {
  test('should get the month', () => {
    expect(utilsHelpers.getMonth(new Date(2020, 0, 1))).toEqual(0);
  });
});
describe('getYear', () => {
  test('should get the year', () => {
    expect(utilsHelpers.getYear(new Date(2020, 0, 1))).toEqual(2020);
  });
});
describe('getStartOfMonth', () => {
  test('should get the start of the month', () => {
    expect(utilsHelpers.getStartOfMonth(new Date(2020, 0, 5))).toEqual(
      new Date(2020, 0, 1),
    );
  });
});
describe('getEndOfMonth', () => {
  test('should get the end of the month', () => {
    expect(utilsHelpers.getEndOfMonth(new Date(2020, 0, 5))).toEqual(
      new Date('2020-02-01T05:59:59.999Z'),
    );
  });
});
describe('addDays', () => {
  test('should add days to the provided date', () => {
    expect(utilsHelpers.addDays(new Date(2020, 0, 1), 4)).toEqual(
      new Date(2020, 0, 5),
    );
  });
});
describe('addMonths', () => {
  test('should add months to the provided date', () => {
    expect(utilsHelpers.addMonths(new Date(2020, 0, 1), 1)).toEqual(
      new Date(2020, 1, 1),
    );
  });
});
describe('subMonths', () => {
  test('should subract months from the provided date', () => {
    expect(utilsHelpers.subMonths(new Date(2020, 2, 1), 1)).toEqual(
      new Date(2020, 1, 1),
    );
  });
});

describe('isBefore', () => {
  test('should return true if the first date is before the second', () => {
    expect(
      utilsHelpers.isBefore(new Date(2020, 0, 1), new Date(2020, 0, 2)),
    ).toEqual(true);
    expect(
      utilsHelpers.isBefore(new Date(2020, 0, 1), new Date(2020, 0, 1)),
    ).toEqual(false);
    expect(
      utilsHelpers.isBefore(new Date(2020, 0, 2), new Date(2020, 0, 1)),
    ).toEqual(false);
  });
});

describe('isAfter', () => {
  test('should return ture if the first date is after the second', () => {
    expect(
      utilsHelpers.isAfter(new Date(2020, 0, 2), new Date(2020, 0, 1)),
    ).toEqual(true);
    expect(
      utilsHelpers.isAfter(new Date(2020, 0, 1), new Date(2020, 0, 1)),
    ).toEqual(false);
    expect(
      utilsHelpers.isAfter(new Date(2020, 0, 1), new Date(2020, 0, 2)),
    ).toEqual(false);
  });
});
