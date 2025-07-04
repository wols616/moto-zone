import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email, password)) {
      navigate("/"); // Redirect to dashboard after successful login
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-motoGray-light">
      <Card className="w-[350px] bg-motoWhite border-motoGray">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-motoRed">Moto-Zone</CardTitle>
          <CardDescription className="text-motoGray">
            Inicia sesión para acceder al panel de gestión.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                type="email"
                id="email"
                placeholder="admin@motozone.com o empleado@motozone.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-motoGray focus:border-motoRed"
              />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                type="password"
                id="password"
                placeholder="password123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-motoGray focus:border-motoRed"
              />
            </div>
            <Button type="submit" className="w-full bg-motoRed hover:bg-motoRed-dark text-motoWhite">
              Iniciar Sesión
            </Button>
          </form>
          <p className="text-center text-sm text-motoGray mt-4">
            Usa "admin@motozone.com" o "empleado@motozone.com" con contraseña "password123"
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;