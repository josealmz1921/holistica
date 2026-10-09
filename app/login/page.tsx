"use client";

import { useRef, useState } from "react";
import { Form, type FormState } from "informed";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon, EyeIcon, EyeSlashIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import Input from "@/src/components/Input";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/src/firebase/firebase";
import { MiniLogo } from "@/src/components/Icons/icons";
import { isRequired } from "@/src/utilities/formValidations";
import { useRouter } from "next/navigation";
import classes from "./login.module.css";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const pending = useRef(false);

    const handleLogin = async (formState: FormState) => {
        if (pending.current) return;
        const { email, password } = formState.values;
        pending.current = true;
        setLoading(true);
        setError("");
        try {
            await signInWithEmailAndPassword(auth, String(email).trim(), String(password));
            router.push("/dashboard/");
        } catch (error: unknown) {
            const code = typeof error === "object" && error !== null && "code" in error ? error.code : "";
            if (code === "auth/too-many-requests") {
                setError("Demasiados intentos. Espera unos minutos antes de volver a ingresar.");
            } else if (code === "auth/network-request-failed") {
                setError("No pudimos conectarnos. Revisa tu conexión e inténtalo de nuevo.");
            } else {
                setError("No pudimos iniciar sesión. Revisa tu correo y contraseña e inténtalo de nuevo.");
            }
            pending.current = false;
            setLoading(false);
        }
    };

    return (
        <main className={classes.root}>
            <div className={classes.shell}>
                <aside className={classes.brandPanel} aria-label="Flor de luna">
                    <Link href="/" className={classes.brand} aria-label="Flor de luna, ir al inicio">
                        <MiniLogo aria-hidden="true" />
                        <span>Flor de luna</span>
                    </Link>
                    <div className={classes.art} aria-hidden="true">
                        <div className={classes.orbit} />
                        <MiniLogo className={classes.flower} />
                    </div>
                    <div className={classes.brandMessage}>
                        <p className={classes.eyebrow}>Tu espacio de bienestar</p>
                        <p className={classes.brandTitle}>Cuidar cada detalle<br />también es cuidar.</p>
                        <p className={classes.brandDescription}>Un lugar para dar forma a las experiencias que compartes.</p>
                    </div>
                </aside>

                <section className={classes.formPanel} aria-labelledby="login-title">
                    <Link href="/" className={classes.back}><ArrowLeftIcon aria-hidden="true" /> Volver al sitio</Link>
                    <header className={classes.header}>
                        <span className={classes.accessIcon}><LockClosedIcon aria-hidden="true" /></span>
                        <p className={classes.eyebrow}>Panel de administración</p>
                        <h1 id="login-title" className={classes.title}>Bienvenida de nuevo</h1>
                        <p className={classes.description}>Ingresa a tu espacio para gestionar el contenido de Flor de luna.</p>
                    </header>
                    <Form className={classes.form} onSubmit={handleLogin}>
                        <fieldset className={classes.fields} disabled={loading} aria-busy={loading}>
                            <Input label="Correo electrónico" identifier="email" type="email" placeholder="tu@correo.com" disabled={loading}
                                validate={value => isRequired(value) || (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim()) ? undefined : "Ingresa un correo válido")}
                                classes={{ input: classes.input, label: classes.label, root: classes.field }} />
                            <Input label="Contraseña" identifier="password" type={showPassword ? "text" : "password"} placeholder="Tu contraseña" validate={isRequired} disabled={loading}
                                classes={{ input: `${classes.input} ${classes.passwordInput}`, label: classes.label, root: classes.field }}
                                after={<button type="button" className={classes.passwordToggle} disabled={loading} onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} aria-pressed={showPassword}>
                                    {showPassword ? <EyeSlashIcon aria-hidden="true" /> : <EyeIcon aria-hidden="true" />}
                                </button>} />
                            {error && <p className={classes.error} role="alert">{error}</p>}
                            <button className={classes.submit} type="submit" disabled={loading}>
                                {loading ? <><span className={classes.spinner} aria-hidden="true" /> Ingresando…</> : <>Entrar al panel <ArrowRightIcon aria-hidden="true" /></>}
                            </button>
                        </fieldset>
                    </Form>
                    <p className={classes.note}><LockClosedIcon aria-hidden="true" /> Acceso exclusivo para administración.</p>
                </section>
            </div>
            <p className={classes.footer}>Flor de luna · Bienestar en cada detalle</p>
        </main>
    );
}
