"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/components/AuthProvider";
import { enter } from "@/components/LoginGate";

import Image from "next/image";

const cobee = "/cobee.png";
const logo = "/timedoor-logo.png";



export default function LoginPage() {
  const [adminOpen, setAdminOpen] = useState(false);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);

  const router = useRouter();
  const { signIn } = useAuth();
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const password = String(new FormData(event.currentTarget).get("password") || "");
    if (!password) return setError("Password is required.");
    setBusy(true);
    const failure = await signIn(password);
    if (failure) {
      setBusy(false);
      return setError(failure);
    }
    enter();
    router.push("/library");
  };

  return (
    <main className="login-page">
      <div className="login-stage">
        {/* Cobee: PNG 960x960 with empty space; cropped via CSS (.login-mascot). */}
        <div className="login-mascot">
          <Image src={cobee} alt="" width={960} height={960} priority />
        </div>
        <section className="login-card" aria-labelledby="login-title">
          <div className="login-top">
            <Image className="login-logo" src={logo} alt="Timedoor Academy" width={2000} height={520} priority />
            <span className="login-tag">Design Library</span>
          </div>
          <h1 id="login-title">Halo, selamat datang!</h1>
          <p className="login-sub">Search and view all Timedoor Academy design files.</p>

          <Link href="/" className="login-cta" onClick={enter}>Lanjut sebagai viewer</Link>

          {adminOpen ? (
            <form className="login-admin" onSubmit={submit} noValidate>
              <label className="form-label" htmlFor="password">Password admin</label>
              <div className="relative">
                <input className="form-input !pr-11" id="password" name="password" type={show ? "text" : "password"} placeholder="Masukkan password" autoComplete="current-password" autoFocus aria-invalid={!!error} aria-describedby={error ? "login-error" : undefined} />
                <button type="button" className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted" onClick={() => setShow((s) => !s)} aria-label={show ? "Sembunyikan password" : "Tampilkan password"} aria-pressed={show}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                    <circle cx="12" cy="12" r="3" />
                    {!show && <path d="M3 3l18 18" />}
                  </svg>
                </button>
              </div>
              {error && <p className="form-error mt-2" id="login-error" role="alert">{error}</p>}
              <button className="login-admin-submit" type="submit" disabled={busy}>{busy ? "Checking…" : "Sign in as admin"}</button>
              <button className="login-toggle" type="button" onClick={() => { setAdminOpen(false); setError(""); }}>Cancel</button>
            </form>
          ) : (
            <button className="login-toggle" type="button" onClick={() => setAdminOpen(true)} aria-expanded={false}>Admin? Sign in with password</button>
          )}
        </section>
      </div>
    </main>
  );
}
