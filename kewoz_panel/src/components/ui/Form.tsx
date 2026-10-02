import * as React from 'react';
import { FormProvider, useFormContext } from 'react-hook-form';
import type { UseFormReturn, FieldValues, SubmitHandler } from 'react-hook-form';

type FormProps<TFieldValues extends FieldValues> = {
  children: React.ReactNode;
  onSubmit: SubmitHandler<TFieldValues>;
  form: UseFormReturn<TFieldValues>;
  className?: string;
} & Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit'>;

export function Form<TFieldValues extends FieldValues>({ 
  children, 
  onSubmit, 
  form, 
  className = '',
  ...props 
}: FormProps<TFieldValues>) {
  return (
    <FormProvider {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className={className}
        {...props}
      >
        {children}
      </form>
    </FormProvider>
  );
}

export type FormFieldContextValue = {
  name: string;
  children: React.ReactNode;
  control?: any;
};

type FormChildInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
};

export function FormField({ name, children }: FormFieldContextValue) {
  const { register, formState } = useFormContext();
  const { errors } = formState;
  const error = errors?.[name];

  return React.Children.map(children, (child) => {
    if (React.isValidElement<FormChildInputProps>(child)) {
      const registerProps = register(name);
      return React.cloneElement(child, {
        ...registerProps,
        error: error?.message as string | undefined,
      } as FormChildInputProps);
    }
    return child;
  });
}

export function FormItem({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2">{children}</div>;
}

export function FormLabel({ children , required }: { children: React.ReactNode  ,required?: boolean}) {
  return (
    <label className="text-sm text-text font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  );
}

export function FormControl({ children }: { children: React.ReactNode }) {
  return <div className="relative">{children}</div>;
}

export function FormMessage({ children, error }: { children?: React.ReactNode; error?: string }) {
  const message = error || children;
  if (!message) return null;

  return (
    <p className="text-sm font-medium text-destructive">
      {message}
    </p>
  );
}
