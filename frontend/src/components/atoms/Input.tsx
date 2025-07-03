import React from 'react';
import { HiExclamationCircle, HiMagnifyingGlass } from 'react-icons/hi2';
import { InputHTMLAttributes, ReactNode } from 'react';

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  id: string;
  name: string;
  type?: string;
  label?: string;
  placeholder?: string;
  status?: 'idle' | 'success' | 'error'; // 인증 상태
  successText?: string; // 성공 메시지
  helpText?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  optional?: boolean;
  defaultValue?: string;
  value?: string;
  rightElement?: ReactNode;
  autoComplete?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export const Input = ({
  id,
  name,
  type = 'text',
  label,
  placeholder,
  successText,
  status,
  helpText,
  error,
  disabled,
  required,
  optional,
  defaultValue,
  value,
  rightElement,
  autoComplete,
  onChange,
  onFocus,
}: InputProps) => {
  const getStatusClass = () => {
    if (status === 'success') {
      return 'outline-green-500 focus:outline-green-600/50';
    }
    if (error || status === 'error') {
      return 'text-red-900 placeholder:text-red-300 outline-red-300/50 focus:outline-red-600/50';
    }
    return ''; // 기본값은 변화 없음
  };

  const inputClasses = `
		block w-full rounded-md bg-white px-3 py-2.5 text-base text-gray-900
		outline outline-[0.125rem] outline-gray-300/50
		placeholder:text-gray-400
		focus:outline-[0.125rem] focus:outline-primary/50
		disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 disabled:outline-gray-200/50
		sm:py-3 sm:text-lg
		${getStatusClass()}
		${rightElement ? 'pr-[6rem]' : ''}
	`;

  return (
    <div>
      <div className="flex justify-between items-center">
        <label
          htmlFor={id}
          className="block text-base font-medium text-gray-900 sm:text-lg"
        >
          {label}
        </label>
        {error && (
          <span className="text-sm text-red-600 sm:text-base">{error}</span>
        )}
        {optional && (
          <span
            id={`${id}-optional`}
            className="text-sm text-gray-500 sm:text-base"
          >
            선택 사항
          </span>
        )}
        {status === 'success' && successText && (
          <span className="text-sm text-green-600 sm:text-base">
            {successText}
          </span>
        )}
      </div>
      <div
        className={`relative mt-1 sm:mt-2 ${error ? 'grid grid-cols-1' : ''}`}
      >
        <input
          className={inputClasses}
          id={id}
          name={name}
          type={type}
          defaultValue={defaultValue}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          onChange={onChange}
          onFocus={onFocus}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={
            error
              ? `${id}-error`
              : helpText
                ? `${id}-description`
                : optional
                  ? `${id}-optional`
                  : undefined
          }
          autoComplete={autoComplete}
        />

        {error && (
          <HiExclamationCircle
            aria-hidden="true"
            className={`
							absolute top-1/2 -translate-y-1/2 text-red-500 w-5 h-5 sm:w-6 sm:h-6 z-10
							right-3
						  `}
          />
        )}
        {/* rightElement 버튼 추가 */}
        {rightElement && (
          <div
            className={`absolute top-1/2 -translate-y-1/2 z-10 ${error ? 'right-10' : 'right-3'}`}
          >
            {rightElement}
          </div>
        )}
      </div>

      {helpText && !error && (
        <p
          id={`${id}-description`}
          className="mt-2 text-base text-gray-500 sm:text-lg"
        >
          {helpText}
        </p>
      )}
    </div>
  );
};

export const EmailInput = (props: Omit<InputProps, 'type'>) => {
  return (
    <Input
      {...props}
      type="email"
      placeholder={props.placeholder || 'example@domain.com'}
    />
  );
};

interface AuthCodeInputProps extends Omit<InputProps, 'type' | 'rightElement'> {
  timer: number;
  isVerified: boolean;
  onVerifyClick: () => void;
}

export const AuthCodeInput = ({
  timer,
  onVerifyClick,
  status,
  error,
  successText,
  isVerified,
  ...props
}: AuthCodeInputProps) => {
  const formattedTime = `${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}`;

  return (
    <Input
      {...props}
      type="text"
      error={status === 'error' ? error : undefined}
      successText={status === 'success' ? successText : undefined}
      status={status}
      placeholder="인증번호를 입력하세요"
      disabled={isVerified}
      rightElement={
        <div className="flex items-center space-x-1">
          <span className="text-red-500 font-bold text-xs w-[3rem] text-right">
            {isVerified ? '' : formattedTime}
          </span>
          <button
            type="button"
            className="bg-gray-300 text-gray-800 px-2 py-1 rounded text-xs hover:bg-gray-400"
            onClick={onVerifyClick}
            disabled={isVerified}
          >
            확인
          </button>
        </div>
      }
    />
  );
};

export const PasswordInput = (props: Omit<InputProps, 'type'>) => {
  return (
    <Input
      {...props}
      type="password"
      placeholder={props.placeholder || '••••••••'}
    />
  );
};

interface NumberInputProps extends Omit<InputProps, 'type'> {
  min?: number;
  max?: number;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const NumberInput = ({
  min,
  max,
  value,
  onChange,
  ...props
}: NumberInputProps) => {
  const numberInputClasses =
    'block w-full rounded-md bg-white px-3 py-2.5 text-base font-bold text-primary text-center outline outline-[0.125rem] outline-gray-300/50 placeholder:text-gray-400 placeholder:font-normal focus:text-gray-900 focus:font-normal focus:outline-[0.125rem] focus:outline-primary/50 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 disabled:outline-gray-200/50 sm:py-3 sm:text-lg';

  return (
    <div>
      <div className="flex justify-between">
        <label
          htmlFor={props.id}
          className="block text-base font-medium text-gray-900 sm:text-lg"
        >
          {props.label}
        </label>
        {props.optional && (
          <span
            id={`${props.id}-optional`}
            className="text-sm text-gray-500 sm:text-base"
          >
            선택 사항
          </span>
        )}
      </div>
      <div className="mt-2 sm:mt-3">
        <input
          id={props.id}
          name={props.name}
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={onChange}
          placeholder={props.placeholder || '0'}
          disabled={props.disabled}
          aria-invalid={props.error ? 'true' : undefined}
          aria-describedby={
            props.error
              ? `${props.id}-error`
              : props.helpText
                ? `${props.id}-description`
                : props.optional
                  ? `${props.id}-optional`
                  : undefined
          }
          className={numberInputClasses}
        />
      </div>
      {props.helpText && !props.error && (
        <p
          id={`${props.id}-description`}
          className="mt-2 text-base text-gray-500 sm:text-lg"
        >
          {props.helpText}
        </p>
      )}
      {props.error && (
        <p
          id={`${props.id}-error`}
          className="mt-2 text-base text-red-600 sm:text-lg"
        >
          {props.error}
        </p>
      )}
    </div>
  );
};

export const DateInput = (props: Omit<InputProps, 'type'>) => {
  return <Input {...props} type="date" />;
};

interface TextAreaProps {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  helpText?: string;
  error?: string;
  disabled?: boolean;
  optional?: boolean;
  defaultValue?: string;
  rows?: number;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  maxLength?: number;
}

export const TextArea = ({
  id,
  name,
  label,
  placeholder,
  helpText,
  error,
  disabled,
  optional,
  defaultValue,
  rows = 4,
  value,
  onChange,
  className,
  maxLength,
}: TextAreaProps) => {
  const textAreaClasses = error
    ? 'block w-full rounded-md bg-white py-1.5 text-base text-red-900 outline outline-[0.125rem] outline-red-300/50 placeholder:text-red-300 focus:outline-[0.125rem] focus:outline-red-600/50 sm:text-sm/6'
    : 'block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-[0.125rem] outline-gray-300/50 placeholder:text-gray-400 focus:outline-[0.125rem] focus:outline-primary/50 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 disabled:outline-gray-200/50 sm:text-sm/6';

  const currentLength = value?.length || 0;
  const isMaxLengthReached =
    maxLength !== undefined && currentLength >= maxLength;

  return (
    <div>
      <div className="flex justify-between">
        <label
          htmlFor={id}
          className="block text-sm/6 font-medium text-gray-900"
        >
          {label}
        </label>
        {optional && (
          <span id={`${id}-optional`} className="text-sm/6 text-gray-500">
            선택 사항
          </span>
        )}
      </div>
      <div className="mt-2">
        <textarea
          id={id}
          name={name}
          rows={rows}
          defaultValue={defaultValue}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={onChange}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={
            error
              ? `${id}-error`
              : helpText
                ? `${id}-description`
                : optional
                  ? `${id}-optional`
                  : undefined
          }
          className={`${textAreaClasses} ${className || ''} ${isMaxLengthReached ? 'outline-red-500' : ''}`}
          maxLength={maxLength}
        />
        {maxLength && (
          <div className="flex justify-end mt-1">
            <span
              className={`text-xs ${isMaxLengthReached ? 'text-red-500 font-medium' : 'text-gray-500'}`}
            >
              {currentLength}/{maxLength}
            </span>
          </div>
        )}
      </div>
      {helpText && !error && (
        <p id={`${id}-description`} className="mt-2 text-sm text-gray-500">
          {helpText}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export const SearchInput = (props: Omit<InputProps, 'type' | 'label'>) => {
  const searchInputClasses =
    'block w-full rounded-full bg-white pl-10 pr-3 py-2.5 text-[1rem] text-gray-900 outline outline-[0.125rem] outline-gray-300/50 placeholder:text-gray-400 focus:outline-[0.125rem] focus:outline-primary/50 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 disabled:outline-gray-200/50 sm:py-3 sm:text-[1.125rem]';

  return (
    <div>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <HiMagnifyingGlass
            className="size-5 text-gray-400 sm:size-6"
            aria-hidden="true"
          />
        </div>
        <input
          id={props.id}
          name={props.name}
          type="search"
          defaultValue={props.defaultValue}
          placeholder={props.placeholder || '이름으로 검색하기'}
          disabled={props.disabled}
          className={searchInputClasses}
        />
      </div>
      {props.helpText && (
        <p
          id={`${props.id}-description`}
          className="mt-2 text-[0.875rem] text-gray-500 sm:text-[1rem]"
        >
          {props.helpText}
        </p>
      )}
    </div>
  );
};

export const SmallSearchInput = (props: Omit<InputProps, 'type' | 'label'>) => {
  const smallSearchInputClasses =
    'block w-full rounded-full bg-white pl-8 pr-3 py-[0.4rem] text-sm text-gray-900 outline outline-[0.125rem] outline-gray-300/50 placeholder:text-gray-400 focus:outline-[0.125rem] focus:outline-primary/50';

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <HiMagnifyingGlass
          className="size-4 text-gray-400"
          aria-hidden="true"
        />
      </div>
      <input
        id={props.id}
        name={props.name}
        type="search"
        defaultValue={props.defaultValue}
        placeholder={props.placeholder || '이름으로 검색하기'}
        disabled={props.disabled}
        className={smallSearchInputClasses}
      />
    </div>
  );
};

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<InputProps, 'type' | 'onChange'> {
  options: SelectOption[];
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const Select = ({
  id,
  name,
  label,
  placeholder,
  options,
  value,
  onChange,
  error,
  disabled,
  optional,
}: SelectProps) => {
  const selectClasses = error
    ? 'block w-full rounded-md bg-white py-2.5 pl-3 pr-10 text-base text-red-900 outline outline-[0.125rem] outline-red-300/50 focus:outline-[0.125rem] focus:outline-red-600/50 sm:py-3 sm:text-lg'
    : 'block w-full rounded-md bg-white px-3 py-2.5 text-base text-gray-900 outline outline-[0.125rem] outline-gray-300/50 focus:outline-[0.125rem] focus:outline-primary/50 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 disabled:outline-gray-200/50 sm:py-3 sm:text-lg ' +
      (value ? 'text-center font-bold text-primary' : '');

  return (
    <div>
      <div className="flex justify-between items-center">
        <label
          htmlFor={id}
          className="block text-base font-medium text-gray-900 sm:text-lg"
        >
          {label}
        </label>
        {error && (
          <span className="text-sm text-red-600 sm:text-base">{error}</span>
        )}
        {optional && (
          <span className="text-sm text-gray-500 sm:text-base">선택 사항</span>
        )}
      </div>
      <div className="mt-2 sm:mt-3">
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={selectClasses}
        >
          <option
            value=""
            disabled
            className="text-left font-normal text-gray-900"
          >
            {placeholder}
          </option>
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="text-center font-bold"
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

// 마이페이지 전용 Input
interface MypageInputProps {
  id: string;
  name: string;
  label: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  labelClassName?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const MypageInput = ({
  id,
  name,
  label,
  value,
  defaultValue,
  disabled = false,
  error,
  className = '',
  labelClassName = '',
  onChange,
}: MypageInputProps) => {
  return (
    <div className="flex flex-col">
      <label
        htmlFor={id}
        className={`text-xs font-medium text-gray-700 mb-1 ${labelClassName}`}
      >
        {label}
      </label>
      <input
        type="text"
        id={id}
        name={name}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        onChange={onChange}
        className={`h-8 px-2 text-sm border border-gray-300 rounded-md 
					${disabled ? 'bg-gray-50 text-gray-500' : 'bg-white'}
					${error ? 'border-red-500' : ''}
					focus:outline-none focus:ring-2 focus:ring-primary-20
					${className}`}
      />
      {error && <span className="mt-1 text-xs text-red-500">{error}</span>}
    </div>
  );
};

// 마이페이지 전용 Select
interface MypageSelectProps {
  id: string;
  name: string;
  label: string;
  options: { value: string; label: string }[];
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  error?: string;
  className?: string;
  labelClassName?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const MypageSelect = ({
  id,
  name,
  label,
  options,
  value,
  defaultValue,
  placeholder,
  error,
  className = '',
  labelClassName = '',
  onChange,
}: MypageSelectProps) => {
  return (
    <div className="flex flex-col">
      <label
        htmlFor={id}
        className={`text-xs font-medium text-gray-700 mb-1 ${labelClassName}`}
      >
        {label}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        className={`h-8 px-2 text-sm border border-gray-300 rounded-md bg-white
					${error ? 'border-red-500' : ''}
					focus:outline-none focus:ring-2 focus:ring-primary-20
					${className}`}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="mt-1 text-xs text-red-500">{error}</span>}
    </div>
  );
};
