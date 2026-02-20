import { type ComponentPropsWithoutRef, type ReactNode } from "react";
import styles from "./Button.module.css";

interface ButtonBaseProps {
  children: ReactNode;
  className?: string;
}

type ButtonPrimaryProps = ButtonBaseProps &
  ComponentPropsWithoutRef<"button"> & {
    variant?: "primary";
    href?: never;
  };

type ButtonPrimaryLinkProps = ButtonBaseProps &
  ComponentPropsWithoutRef<"a"> & {
    variant?: "primary";
    href: string;
  };

type ButtonSecondaryProps = ButtonBaseProps &
  ComponentPropsWithoutRef<"button"> & {
    variant: "secondary";
    href?: never;
  };

type ButtonSecondaryLinkProps = ButtonBaseProps &
  ComponentPropsWithoutRef<"a"> & {
    variant: "secondary";
    href: string;
  };

type ButtonProps =
  | ButtonPrimaryProps
  | ButtonPrimaryLinkProps
  | ButtonSecondaryProps
  | ButtonSecondaryLinkProps;

export function Button({
  children,
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  const cls = `${variant === "primary" ? styles.primary : styles.secondary} ${className ?? ""}`;

  if ("href" in props && props.href) {
    const { href, ...rest } = props as ButtonPrimaryLinkProps | ButtonSecondaryLinkProps;
    return (
      <a href={href} className={cls} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <button className={cls} {...(props as ComponentPropsWithoutRef<"button">)}>
      {children}
    </button>
  );
}

interface ButtonIconProps extends ComponentPropsWithoutRef<"button"> {
  children: ReactNode;
  label: string;
  className?: string;
}

export function ButtonIcon({
  children,
  label,
  className,
  ...props
}: ButtonIconProps) {
  return (
    <button
      className={`${styles.icon} ${className ?? ""}`}
      aria-label={label}
      {...props}
    >
      {children}
    </button>
  );
}
