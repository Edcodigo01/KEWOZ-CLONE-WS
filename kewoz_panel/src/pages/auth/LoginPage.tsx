import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { LoginForm } from '@/components/auth/LoginForm';
import MockDetails from '@/components/ui/login/mock_details';
import Line from "/assets/vector_bottom.png";

import { Button } from '@/components/ui';
import { useProjectConfigStore } from '@/stores/useProjectConfigStore';
import { useThemeStore } from '@/store/theme/themeStore';

const LoginPage = () => {
  const navigate = useNavigate();
  const { config, isLoading, error, fetchConfig } = useProjectConfigStore()

  useEffect(() => {
    if (!config) {
      fetchConfig();
    }
  }, [config, fetchConfig]);

  const handleLoginSuccess = () => {
    toast.success('¡Inicio de sesión exitoso!');
    navigate('/dashboard');
  };

  const handleLoginError = (error: Error) => {
    toast.error(error.message || 'Error al iniciar sesión. Por favor, inténtelo de nuevo.');
  };

  // Get the current theme from the theme store
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);

  return (
    <div className="min-h-screen bg-gradient-to- bg-secondary ">
      <div className="container mx-auto h-screen lg:max-w-none">
        <div className="grid h-full lg:grid-cols-2">

          {/* Left side - Mock Details */}
          <div className="hidden lg:flex">
            <MockDetails />
          </div>

          {/* Right side - Login Form */}
          <div className="flex flex-col items-center  bg-[#FFF]    justify-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-lg space-y-8">

              {/* Logo Section */}
              <div className="text-cente ml-[-1rem]">
                <img
                  src={config?.web_logo_light}
                  alt="Logo"
                  className="h-20"
                />
              </div>

              {/* Welcome Text */}
              <div className="text-center lg:text-left">
                <h2 className="font-bold   text-[#424242] text-2xl sm:text-3xl lg:text-4xl xl:text-5xl leading-tight max-w-md lg:max-w-lg">
                  ¡Bienvenido de nuevo! Por favor{" "}
                  <span className="relative inline-block">
                    inicia sesión para
                    <img
                      src={Line}
                      className="absolute left-0 top-full w-full mt-1 image-color"
                      alt="Subrayado decorativo"
                    />
                  </span>{" "}
                  continuar.
                </h2>
              </div>

              {/* Login Form Card */}
              <div className="w-full ">
                <LoginForm
                  onSuccess={handleLoginSuccess}
                  onError={handleLoginError}
                />
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;