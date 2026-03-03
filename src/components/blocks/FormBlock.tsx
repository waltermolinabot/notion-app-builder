"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface FormFieldConfig {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

interface FormBlockProps {
  config: {
    title?: string;
    fields?: FormFieldConfig[];
    submitLabel?: string;
    databaseId?: string;
    mode?: "create" | "edit";
  };
  appId: string;
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
  initialData?: Record<string, any>;
}

export function FormBlock({ config, appId, onSuccess, onCancel, initialData }: FormBlockProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>(initialData || {});

  function handleChange(field: string, value: any) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function validate(): boolean {
    for (const field of config.fields || []) {
      if (field.required && !formData[field.name]) {
        setSubmitResult({
          success: false,
          message: `El campo ${field.label} es requerido`,
        });
        return false;
      }
      if (field.type === "email" && formData[field.name]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData[field.name])) {
          setSubmitResult({
            success: false,
            message: "Email inválido",
          });
          return false;
        }
      }
    }
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!validate()) return;

    if (!config.databaseId) {
      setSubmitResult({
        success: false,
        message: "No hay base de datos configurada",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const response = await fetch("/api/notion/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          databaseId: config.databaseId,
          data: [formData],
          mode: config.mode || "create",
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitResult({
          success: true,
          message: "Registro creado exitosamente",
        });
        setFormData({});
        onSuccess?.(formData);
      } else {
        setSubmitResult({
          success: false,
          message: result.error || "Error al crear el registro",
        });
      }
    } catch (error) {
      setSubmitResult({
        success: false,
        message: "Error de conexión",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitResult?.success) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">¡Enviado!</h3>
            <p className="text-muted-foreground mb-4">{submitResult.message}</p>
            <Button onClick={() => setSubmitResult(null)}>
              Enviar otro
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{config.title || "Formulario"}</CardTitle>
        {config.submitLabel && (
          <CardDescription>
            Completa el formulario para {config.mode === "edit" ? "actualizar" : "crear"} un registro
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {config.fields?.map((field) => (
            <div key={field.name}>
              <Label>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              {renderFieldInput(field)}
            </div>
          ))}

          {submitResult && !submitResult.success && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              {submitResult.message}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {config.submitLabel || "Enviar"}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

/**
 * Render the appropriate input based on field type
 */
function renderFieldInput(field: FormFieldConfig): React.ReactNode {
  const value = field.name; // This would be from form state in a real implementation

  switch (field.type) {
    case "textarea":
      return (
        <Textarea
          placeholder={field.placeholder}
          onChange={(e) => {}}
        />
      );

    case "select":
      return (
        <Select onValueChange={() => {}}>
          <SelectTrigger>
            <SelectValue placeholder={field.placeholder || "Selecciona una opción"} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case "checkbox":
      return (
        <div className="flex items-center space-x-2">
          <Checkbox id={field.name} onCheckedChange={() => {}} />
          <Label htmlFor={field.name} className="text-sm font-normal">
            {field.placeholder}
          </Label>
        </div>
      );

    case "switch":
      return (
        <div className="flex items-center space-x-2">
          <Switch id={field.name} onCheckedChange={() => {}} />
          <Label htmlFor={field.name} className="text-sm font-normal">
            {field.placeholder}
          </Label>
        </div>
      );

    case "date":
      return (
        <Input
          type="date"
          placeholder={field.placeholder}
          onChange={(e) => {}}
        />
      );

    case "email":
      return (
        <Input
          type="email"
          placeholder={field.placeholder}
          onChange={(e) => {}}
        />
      );

    case "phone":
      return (
        <Input
          type="tel"
          placeholder={field.placeholder}
          onChange={(e) => {}}
        />
      );

    case "url":
      return (
        <Input
          type="url"
          placeholder={field.placeholder}
          onChange={(e) => {}}
        />
      );

    case "number":
      return (
        <Input
          type="number"
          placeholder={field.placeholder}
          onChange={(e) => {}}
        />
      );

    default:
      return (
        <Input
          placeholder={field.placeholder}
          onChange={(e) => {}}
        />
      );
  }
}

export default FormBlock;
