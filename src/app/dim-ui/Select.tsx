import { moveDownIcon, moveUpIcon } from 'app/shell/icons';
import AppIcon from 'app/shell/icons/AppIcon';
import clsx from 'clsx';
import { useSelect } from 'downshift';
import React, { CSSProperties, ReactNode, useRef, useState } from 'react';
import styles from './Select.m.scss';
import { usePopper } from './usePopper';

export interface Option<T> {
  key: string;
  content: ReactNode;
  disabled?: boolean;
  value?: T;
}

interface Props<T> {
  className?: string;
  /** Hide the selected option from the dropdown */
  hideSelected?: boolean;
  disabled?: boolean;
  /** Sets the max width for the button. */
  maxButtonWidth?: number;
  /**
   * Sets the max width for the dropdown.
   *
   * If 'button' is used the two things can happen:
   * 1. If maxButtonWidth is set it will use that as the max width.
   * 2. If maxButtonWidth is undefined it will calculate the width
   * of the button dynamically and use that to set the max width.
   */
  maxDropdownWidth?: number | 'button';
  value?: T;
  options: Option<T>[];
  /** Optional override for the button content */
  children?: ReactNode;
  onChange(value?: T): void;
}

/**
 * A Select menu, which maintains a current value and a dropdown to choose
 * another value. A replacement for HTML's <select> element. This is a
 * controlled component.
 *
 * @see Dropdown for a menu of commands
 * @see MultiSelect for multiple-item selector
 */
export default function Select<T>({
  className,
  disabled,
  maxButtonWidth,
  maxDropdownWidth,
  options: items,
  onChange,
  value,
  hideSelected,
  children,
}: Props<T>) {
  const {
    isOpen,
    getToggleButtonProps,
    getMenuProps,
    highlightedIndex,
    getItemProps,
    selectedItem,
  } = useSelect({
    items,
    selectedItem: items.find((o) => o.value === value),
    itemToString: (i) => i?.key || 'none',
    onSelectedItemChange: ({ selectedItem }) => onChange(selectedItem?.value),
  });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const [dropdownWidth, setDropdownWidth] = useState<number | undefined>(() =>
    typeof maxDropdownWidth === 'number' ? maxDropdownWidth : undefined
  );

  usePopper({
    contents: menuRef,
    reference: buttonRef,
    placement: 'bottom-start',
    offset: 2,
  });

  if (!selectedItem) {
    throw new Error('value must correspond to one of the provided options');
  }

  let buttonStyle: CSSProperties | undefined;
  let dropdownStyle: CSSProperties | undefined;

  if (maxButtonWidth !== undefined) {
    buttonStyle = {
      maxWidth: maxButtonWidth,
    };
  }

  if (maxDropdownWidth === 'button' && dropdownWidth === undefined && buttonRef.current) {
    // Minus 2 because the menu has a thicker outline than the button border (2px vs 1px)
    const width =
      maxButtonWidth !== undefined
        ? maxButtonWidth
        : buttonRef.current.getBoundingClientRect().width - 2;
    setDropdownWidth(width);
  }

  if (dropdownWidth !== undefined) {
    dropdownStyle = {
      maxWidth: dropdownWidth,
    };
  }

  return (
    <div className={className}>
      {children ? (
        <button
          type="button"
          style={buttonStyle}
          {...getToggleButtonProps({ ref: buttonRef })}
          disabled={disabled}
        >
          {children}
        </button>
      ) : (
        <button
          type="button"
          {...getToggleButtonProps({ ref: buttonRef })}
          className={styles.button}
          disabled={disabled}
        >
          {selectedItem.content}{' '}
          <AppIcon icon={isOpen ? moveUpIcon : moveDownIcon} className={styles.arrow} />
        </button>
      )}
      <div
        {...getMenuProps({ ref: menuRef })}
        className={clsx(styles.menu, { [styles.open]: isOpen })}
      >
        <div style={dropdownStyle}>
          {isOpen &&
            items.map(
              (item, index) =>
                !(hideSelected && item.value === value) && (
                  <div
                    className={clsx(styles.menuItem, {
                      [styles.highlighted]: highlightedIndex === index,
                      highlighted: highlightedIndex === index,
                      [styles.disabled]: item.disabled,
                    })}
                    key={item.key}
                    {...getItemProps({
                      item,
                      index,
                      onClick: (e: any) => {
                        e.nativeEvent.preventDownshiftDefault = item.disabled;
                      },
                    })}
                  >
                    {item.content}
                  </div>
                )
            )}
        </div>
      </div>
    </div>
  );
}
