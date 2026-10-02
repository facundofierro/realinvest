"use client";

export function KycStepper({ steps, currentStep }: { steps: readonly string[]; currentStep: number }) {
  return <div className="space-y-2"><div className="flex gap-1">{steps.map((step, index) => <div key={step} className={`h-1.5 flex-1 rounded ${index <= currentStep ? "bg-primary" : "bg-muted"}`} />)}</div><div className="text-center text-sm font-medium sm:flex sm:justify-between sm:text-left">{steps.map((step, index) => <span key={step} className={index === currentStep ? "block" : "hidden sm:block text-muted-foreground"}>{step}</span>)}</div></div>;
}
