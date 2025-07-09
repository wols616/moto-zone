import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useBackendStatus } from "@/hooks/use-backend-status";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const { isBackendAvailable, isChecking, recheckStatus } = useBackendStatus();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Iniciar Sesión</h2>

          {/* Status indicator */}
          {!isChecking && (
            <div className="mt-2">
              {isBackendAvailable === false ? (
                <div className="text-sm bg-orange-50 text-orange-700 p-2 rounded-md border border-orange-200">
                  🎭 <strong>Modo Demostración</strong>
                  <br />
                  Usuario: cualquiera | Contraseña:{" "}
                  <code className="bg-orange-100 px-1 rounded">
                    demo
                  </code> o{" "}
                  <code className="bg-orange-100 px-1 rounded">123456</code>
                  <br />
                  <button 
                    onClick={recheckStatus}
                    className="text-xs underline hover:no-underline mt-1"
                  >
                    Verificar conexión de nuevo
                  </button>
                </div>
              ) : isBackendAvailable === true ? (
                <div className="text-sm bg-green-50 text-green-700 p-2 rounded-md border border-green-200">
                  ✅ Conectado al servidor
                </div>
              ) : null}
            </div>
          )}
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
