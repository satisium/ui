// Design system reminder: Shared Satisium UI grammar — neutral rounded surfaces, primary-orange intent and accessible utility controls.

import { StudioShell } from "@/components/studio/StudioShell";
import { Button } from "@/components/ui/button";
import { Check, Mail, MapPin } from "lucide-react";
import { FormEvent, useState } from "react";

type FormState = {
  name: string;
  email: string;
  project: string;
  message: string;
};
const initialForm: FormState = {
  name: "",
  email: "",
  project: "Portrait sitting",
  message: "",
};

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Please add your name, email and a short note about the work.");
      return;
    }
    setError("");
    setSubmitted(true);
  };

  return (
    <StudioShell>
      <main className="px-3 py-3 sm:px-5 sm:py-5">
        <div className="mx-auto grid max-w-[1440px] gap-5 rounded-[1.4rem] bg-background p-5 sm:p-8 lg:grid-cols-[0.85fr_1.15fr] lg:p-12">
          <section className="rounded-[1.4rem] bg-muted p-6 sm:p-8">
            <p className="flex items-center gap-2 font-mono text-[10px] text-primary uppercase">
              <span className="size-1.5 rounded-full bg-primary" />
              CONTACT / FIRST FRAME
            </p>
            <h1 className="mt-5 font-sans text-5xl font-extrabold leading-[0.9] tracking-[-0.06em] sm:text-6xl">
              Make a little room for the work.
            </h1>
            <p className="mt-7 max-w-md font-sans text-base leading-7 text-muted-foreground">
              Tell us what is forming. A half-idea is a perfectly good place to
              begin.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-3">
              <div className="overflow-hidden rounded-xl">
                <img
                  src="https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=700&q=85"
                  alt="Photographer looking through a camera"
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>
              <div className="mt-7 overflow-hidden rounded-xl">
                <img
                  src="https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?auto=format&fit=crop&w=700&q=85"
                  alt="Sunlit creative studio workspace"
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>
              <p className="col-span-2 font-mono text-[10px] text-muted-foreground uppercase">
                STUDIO NOTES / 06.24
              </p>
            </div>
            <div className="mt-8 space-y-5 border-t border-border pt-6 font-sans text-sm text-muted-foreground">
              <p className="flex gap-3">
                <Mail className="mt-0.5 size-4 text-primary" />
                studio@lumenhouse.example
              </p>
              <p className="flex gap-3">
                <MapPin className="mt-0.5 size-4 text-primary" />
                Amsterdam · London · Available elsewhere
              </p>
            </div>
          </section>
          <section className="rounded-[1.4rem] bg-muted p-6 sm:p-8">
            {submitted ? (
              <div className="grid min-h-96 place-items-center rounded-[1.4rem] bg-background p-8 text-center shadow-sm">
                <div>
                  <Check className="mx-auto size-8 text-primary" />
                  <h2 className="mt-5 font-sans text-3xl font-bold tracking-tight">
                    The first note is in.
                  </h2>
                  <p className="mt-3 max-w-sm font-sans text-sm leading-6 text-muted-foreground">
                    This demo form has recorded your intent in the interface. A
                    real studio would reply with next steps.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setForm(initialForm);
                      setSubmitted(false);
                    }}
                    className="mt-7 h-11 rounded-xl border-border bg-background font-sans text-xs font-semibold"
                  >
                    Send another note
                  </Button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={submit}
                className="space-y-7 rounded-[1.4rem] bg-background p-6 shadow-sm sm:p-8"
                noValidate
              >
                <div className="grid gap-7 sm:grid-cols-2">
                  <Field
                    label="Your name"
                    id="name"
                    value={form.name}
                    onChange={value => setForm({ ...form, name: value })}
                    autoComplete="name"
                  />
                  <Field
                    label="Email"
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={value => setForm({ ...form, email: value })}
                    autoComplete="email"
                  />
                </div>
                <label className="block">
                  <span className="font-mono text-[10px] text-muted-foreground uppercase">
                    The work
                  </span>
                  <select
                    value={form.project}
                    onChange={event =>
                      setForm({ ...form, project: event.target.value })
                    }
                    className="mt-3 h-12 w-full rounded-xl border border-input bg-background px-4 font-sans text-sm outline-none focus:border-primary"
                  >
                    <option>Portrait sitting</option>
                    <option>Brand campaign</option>
                    <option>Intimate event</option>
                    <option>Something else</option>
                  </select>
                </label>
                <label className="block">
                  <span className="font-mono text-[10px] text-muted-foreground uppercase">
                    A short note
                  </span>
                  <textarea
                    value={form.message}
                    onChange={event =>
                      setForm({ ...form, message: event.target.value })
                    }
                    rows={6}
                    className="mt-3 w-full resize-y rounded-xl border border-input bg-background p-4 font-sans text-sm leading-6 outline-none focus:border-primary"
                    placeholder="What do you want the pictures to hold?"
                  />
                </label>
                {error && (
                  <p
                    role="alert"
                    className="font-sans text-sm text-destructive"
                  >
                    {error}
                  </p>
                )}
                <Button
                  type="submit"
                  className="h-12 rounded-xl bg-primary px-5 font-sans text-xs font-semibold hover:bg-primary/90"
                >
                  Send first note →
                </Button>
              </form>
            )}
          </section>
        </div>
      </main>
    </StudioShell>
  );
}

function Field({
  label,
  id,
  type = "text",
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] text-muted-foreground uppercase">
        {label}
      </span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={event => onChange(event.target.value)}
        autoComplete={autoComplete}
        className="mt-3 h-12 w-full rounded-xl border border-input bg-background px-4 font-sans text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
      />
    </label>
  );
}
