// components/ErrorBoundary.tsx
// Captura errores React no manejados para evitar white screen of death
// En producción, muestra un mensaje al usuario y permite reintentar

import React, { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    console.error("[ErrorBoundary] Error capturado:", error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary] Stack trace:", info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 bg-dominos-cream items-center justify-center px-6">
          <Text className="text-6xl mb-4">⚠️</Text>
          <Text className="text-2xl font-bold text-dominos-gray-dark mb-4 text-center">
            Algo salió mal
          </Text>
          <Text className="text-dominos-gray-mid text-center mb-6 text-base leading-6">
            La aplicación encontró un error inesperado. Por favor, intenta reiniciar.
          </Text>
          {__DEV__ && this.state.error && (
            <Text className="text-xs text-dominos-red mb-6 text-center font-mono">
              {this.state.error.message}
            </Text>
          )}
          <Pressable
            onPress={this.handleReset}
            className="bg-dominos-red rounded-xl px-8 py-3 active:opacity-70"
          >
            <Text className="text-white font-bold text-base">Reintentar</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}
