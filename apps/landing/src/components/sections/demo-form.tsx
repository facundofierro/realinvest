"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { ctaClass } from "@/components/cta-link";
import { demoForm } from "@/content/es";
import {
  demoRequestSchema,
  type DemoRequestInput,
} from "@/lib/demo-request-schema";
import { cn } from "@/lib/utils";

const controlClass =
  "min-h-[46px] w-full rounded-xl border-[1.5px] border-[#CFC3D6] bg-white px-3.5 py-2.5 text-base text-ink focus:border-brand focus:outline-[3px] focus:outline-[#D9B8EE] aria-[invalid=true]:border-accent";

type FieldName = keyof DemoRequestInput;

const defaultValues: DemoRequestInput = {
  nombre: "",
  empresa: "",
  email: "",
  telefono: "",
  pais: "",
  proyectos: "",
  intereses: [],
  comentarios: "",
  website: "",
};

export function DemoForm({ privacyUrl }: { privacyUrl?: string }) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>(demoForm.error);
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DemoRequestInput>({
    resolver: zodResolver(demoRequestSchema),
    defaultValues,
  });

  // Values stay in the form on any failure so the user can retry.
  async function onSubmit(values: DemoRequestInput) {
    setStatus("idle");
    try {
      const response = await fetch("/api/demo-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (response.ok) {
        setStatus("success");
        return;
      }
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        fieldErrors?: Partial<Record<FieldName, string[]>>;
      } | null;
      for (const [name, messages] of Object.entries(payload?.fieldErrors ?? {})) {
        if (name in defaultValues && messages?.[0]) {
          setError(name as FieldName, { message: messages[0] });
        }
      }
      setErrorMessage(
        response.status === 429 && payload?.error ? payload.error : demoForm.error,
      );
      setStatus("error");
    } catch {
      setErrorMessage(demoForm.error);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="grid gap-3 rounded-[20px] border border-card-border bg-card p-8 text-ink"
      >
        <svg viewBox="0 0 48 48" className="size-12" aria-hidden="true">
          <circle cx="24" cy="24" r="24" fill="#DDF3E4" />
          <path
            d="M15 25l6 6 12-13"
            stroke="#14602B"
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h3 className="text-2xl font-semibold">{demoForm.successTitle}</h3>
        <p className="text-muted-foreground">{demoForm.success}</p>
      </div>
    );
  }

  const field = (
    name: Exclude<FieldName, "intereses" | "proyectos" | "comentarios" | "website">,
    label: string,
    props: React.ComponentProps<"input"> = {},
  ) => (
    <div className="grid gap-1.5">
      <label htmlFor={`demo-${name}`} className="text-sm font-semibold">
        {label}
      </label>
      <input
        id={`demo-${name}`}
        type="text"
        className={controlClass}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `demo-${name}-error` : undefined}
        {...props}
        {...register(name)}
      />
      <FieldError id={`demo-${name}-error`} message={errors[name]?.message} />
    </div>
  );

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-4 rounded-[20px] border border-card-border bg-card p-6 text-ink sm:p-8"
    >
      <h3 className="text-2xl font-semibold">{demoForm.title}</h3>

      {field("nombre", demoForm.fields.name, { autoComplete: "name" })}
      {field("empresa", demoForm.fields.company, { autoComplete: "organization" })}
      <div className="grid gap-4 sm:grid-cols-2">
        {field("email", demoForm.fields.email, {
          type: "email",
          autoComplete: "email",
        })}
        {field("telefono", demoForm.fields.phone, {
          type: "tel",
          autoComplete: "tel",
        })}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {field("pais", demoForm.fields.country, { autoComplete: "country-name" })}
        <div className="grid gap-1.5">
          <label htmlFor="demo-proyectos" className="text-sm font-semibold">
            {demoForm.fields.projects}
          </label>
          <Controller
            name="proyectos"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ?? ""}
                onValueChange={field.onChange}
                name={field.name}
              >
                <SelectTrigger
                  id="demo-proyectos"
                  ref={field.ref}
                  onBlur={field.onBlur}
                  className={cn(
                    controlClass,
                    "h-auto justify-between shadow-none data-[placeholder]:text-[#6B5A74]",
                  )}
                  aria-invalid={Boolean(errors.proyectos)}
                >
                  <SelectValue placeholder={demoForm.fields.projectsPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {demoForm.projectOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError message={errors.proyectos?.message} />
        </div>
      </div>

      <fieldset className="grid gap-2.5">
        <legend className="mb-2 text-sm font-semibold">
          {demoForm.fields.interests}
        </legend>
        <div className="flex flex-wrap gap-2">
          {demoForm.interestOptions.map((option) => (
            <label
              key={option}
              className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border-[1.5px] border-[#CFC3D6] bg-white px-3.5 py-2 text-sm has-[:checked]:border-brand has-[:checked]:bg-tint has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-[#D9B8EE]"
            >
              <input
                type="checkbox"
                value={option}
                className="size-4 accent-brand"
                {...register("intereses")}
              />
              {option}
            </label>
          ))}
        </div>
        <FieldError message={errors.intereses?.message} />
      </fieldset>

      <div className="grid gap-1.5">
        <label htmlFor="demo-comentarios" className="text-sm font-semibold">
          {demoForm.fields.comments}
        </label>
        <textarea
          id="demo-comentarios"
          rows={3}
          className={controlClass}
          aria-invalid={Boolean(errors.comentarios)}
          {...register("comentarios")}
        />
        <FieldError message={errors.comentarios?.message} />
      </div>

      {/* Honeypot: hidden from people and assistive tech. */}
      <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
        <label htmlFor="demo-website">Sitio web</label>
        <input
          id="demo-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("website")}
        />
      </div>

      {status === "error" && (
        <p
          role="alert"
          className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm font-medium text-[#A01E4D]"
        >
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(ctaClass("primary"), "w-full cursor-pointer")}
      >
        {isSubmitting ? demoForm.submitting : demoForm.submit}
      </button>
      <p className="text-[13px] text-[#6B5A74]">
        {demoForm.privacy}
        {privacyUrl && (
          <>
            {" "}
            {demoForm.privacyLinkPrefix}{" "}
            <a href={privacyUrl} className="underline">
              {demoForm.privacyLinkLabel}
            </a>
            .
          </>
        )}
      </p>
    </form>
  );
}

function FieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-[13px] font-medium text-[#A01E4D]">
      {message}
    </p>
  );
}
