import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import {
  Card,
  CardContent,
  CardFooter,
} from '../ui/Card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

// ✅ Zod Schema
const loginFormSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo es obligatorio')
    .email('Por favor, ingresa un correo válido'),
  password: z
    .string()
    .min(1, 'La contraseña es obligatoria')
    .min(8, 'La contraseña debe tener al menos 8 caracteres'),
  rememberMe: z.boolean().optional(),
});

// ✅ Demo Credentials
const DEMO_CREDENTIALS = {
  email: 'demo@whoxa.com',
  password: 'Admin@123?',
};

interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

type LoginFormValues = z.infer<typeof loginFormSchema>;

export function LoginForm({ onSuccess, onError, className }: LoginFormProps) {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const { formState: { isSubmitting }, setValue } = form;

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login({ email: data.email, password: data.password });
      onSuccess?.();
    } catch (error) {
      console.error('Login failed:', error);
      onError?.(error as Error);
    }
  };

  return (
    <div className="w-full    ">
      <Form<LoginFormValues> form={form} onSubmit={onSubmit}>
        <CardContent className="w-full flex    flex-col  gap-4">
          {/* Email Field */}
          <FormField name="email">
            <FormItem>
              <label htmlFor="Password" className=' text-black   font-normal '> Correo <span className=' text-red-500'>*</span></label>
              <FormControl>
                <div className="relative mt-2">
                  <Input
                    type="email"
                    placeholder="Ingresa tu correo"
                    autoComplete="email"
                    disabled={isSubmitting}
                    className="w-full pl-10  text-black bg-white pr-4"
                    {...form.register("email")}
                  />
                  <Mail className="absolute  text-black left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          {/* Password Field */}
          <FormField name="password">
            <FormItem>
              <label htmlFor="Password" className=' text-black  font-normal '> Contraseña <span className=' text-red-500'>*</span></label>
              <FormControl>
                <div className="relative mt-2">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingresa tu contraseña"
                    autoComplete="current-password"
                    disabled={isSubmitting}
                    className="w-full pl-10  text-black bg-white pr-10"
                    {...form.register("password")}
                  />
                  <Lock className="absolute text-black left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 text-black -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isSubmitting}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </CardContent>

        {/* Submit Button */}
        <CardFooter className="flex flex-col  mt-8 w-full">
          <Button
            type="submit"
            className="  mx-auto  w-[40%]   bg-primary  text-button-text     cursor-pointer  border border-primary  py-2  font-medium rounded-md transition-colors duration-200"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Iniciando sesión...
              </span>
            ) : (
              "Iniciar Sesión"
            )}
          </Button>
        </CardFooter>

        {/* Demo Credentials Table */}
        {import.meta.env.VITE_PRODUCT_TYPE === "demo" && (
          <div className="py-8 text-center rounded-lg w-full">
            <table className="w-full border-collapse">
              <tbody>
                <tr className="border border-border">
                  <td className="px-4 py-2 text-left font-poppins text-black  border-primary border">
                    Correo:
                  </td>
                  <td className="px-4 py-2 text-black font-poppins text-left border border-primary">
                    {DEMO_CREDENTIALS.email}
                  </td>
                </tr>
                <tr className="border border-primary">
                  <td className="px-4 py-2 text-left font-poppins text-black border border-primary">
                    Contraseña:
                  </td>
                  <td className="px-4 py-2 text-black font-poppins text-left border border-primary">
                    {DEMO_CREDENTIALS.password}
                  </td>
                </tr>
                <tr className="border border-primary cursor-pointer">
                  <td
                    colSpan={2}
                    className="px-4 py-4 text-center border border-primary"
                  >
                    <button
                      className="mx-auto w-[40%] bg-primary cursor-pointer text-button-text via-primary border border-primary to-primary/50 py-2 px-4 font-medium rounded-md transition-colors duration-200"
                      onClick={(e) => {
                        e.preventDefault();
                        setValue("email", DEMO_CREDENTIALS.email);
                        setValue("password", DEMO_CREDENTIALS.password);
                      }}
                    >
                      Copiar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

      </Form>
    </div>

  );
}
