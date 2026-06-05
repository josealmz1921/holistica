import { createPortal } from 'react-dom';
import { useField, FieldState } from 'informed';
import DatePickerLib from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useMemo } from 'react';
import classes from './datePicker.module.css';
import { DatePickerProps } from './types';
import { CalendarDateRangeIcon } from '@heroicons/react/24/outline'; 

const DatePicker = (props: DatePickerProps) => {
  const {
    field,
    label,
    minDate,
    maxDate,
    required,
    validate,
    disabled
  } = props;

  const { fieldState, fieldApi, render } = useField({
    name: field,
    validate,
    required,
    validateOn: 'submit'
  });

  const { value, error }: FieldState = fieldState;
  const { setValue, setTouched } = fieldApi;

  const parseLocalDateTime = (value?: string) => {
    if (!value) return null;

    const [datePart, timePart] = value.split('T');
    const [yyyy, mm, dd] = datePart.split('-').map(Number);
    const [HH = 0, MM = 0, SS = 0] = (timePart || '')
      .split(':')
      .map(Number);

    return new Date(yyyy, mm - 1, dd, HH, MM, SS);
  };

  const formatLocalDateTime = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const HH = String(date.getHours()).padStart(2, '0');
    const MM = String(date.getMinutes()).padStart(2, '0');
    const SS = String(date.getSeconds()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd}T${HH}:${MM}:${SS}`;
  };

  const selectedDate = useMemo(() => {
    return typeof value === 'string'
      ? parseLocalDateTime(value)
      : null;
  }, [value]);

  return render((
    <div className={classes.root}>
      <label className={classes.label}>{label}</label>

      <div className={classes.datePickerContainer}>
        <CalendarDateRangeIcon className={classes.icon} />

        <DatePickerLib
          disabled={disabled}
          selected={selectedDate}
          onChange={(date: Date | null) => {
            if (!date) {
              setValue(undefined);
              return;
            }
            setValue(formatLocalDateTime(date));
          }}
          onBlur={() => setTouched(true)}
          minDate={minDate}
          maxDate={maxDate}
          dateFormat="yyyy-MM-dd"
          placeholderText="dd/mm/aaaa"
          popperClassName={classes.datePickerPopper}
          wrapperClassName={classes.datePickerWrapper}
          className={`${disabled ? classes.disabled : classes.datePicker} ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          popperContainer={({ children }) =>
            createPortal(children, document.body)
          }
        />
      </div>

      {error ? (
        <p className={classes.datePickerError}>
          {String(error)}
        </p>
      ) : null}
    </div>
  ));
};

export default DatePicker;
