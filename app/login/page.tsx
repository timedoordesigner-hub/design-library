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

  const router = useRouter();
  const { signIn } = useAuth();
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const password = String(new FormData(event.currentTarget).get("password") || "");
    if (!password) return setError("Password wajib diisi.");
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
        {/* Cobee: PNG 960x960 dengan ruang kosong; dipotong lewat CSS (.login-mascot). */}
        <div className="login-mascot">
          <Image src={cobee} alt="" width={960} height={960} priority />
        </div>
        <section className="login-card" aria-labelledby="login-title">
          <div className="login-top">
            <Image className="login-logo" src={logo} alt="Timedoor Academy" width={2000} height={520} priority />
            <span className="login-tag">Design Library</span>
          </div>
          <h1 id="login-title">Halo, selamat datang!</h1>
          <p className="login-sub">Cari dan lihat semua file design Timedor Academy.</p>

          <Link href="/" className="login-cta" onClick={enter}>Lanjut sebagai viewer</Link>

          {adminOpen ? (
            <form className="login-admin" onSubmit={submit} noValidate>
              <label className="form-label" htmlFor="password">Password admin</label>
              <input className="form-input" id="password" name="password" type="password" placeholder="Masukkan password" autoComplete="current-password" autoFocus aria-invalid={!!error} aria-describedby={error ? "login-error" : undefined} />
              {error && <p className="form-error mt-2" id="login-error" role="alert">{error}</p>}
              <button className="login-admin-submit" type="submit" disabled={busy}>{busy ? "Memeriksa…" : "Masuk sebagai admin"}</button>
              <button className="login-toggle" type="button" onClick={() => { setAdminOpen(false); setError(""); }}>Batal</button>
            </form>
          ) : (
            <button className="login-toggle" type="button" onClick={() => setAdminOpen(true)} aria-expanded={false}>Admin? Masuk dengan password</button>
          )}
        </section>
      </div>
    </main>
  );
}
