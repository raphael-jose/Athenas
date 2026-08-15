// ══════════════════════════════════════════════════════════════
// Athenas — Minha conta (cadastro local + recuperação de senha)
// ══════════════════════════════════════════════════════════════
import { useState } from "react";
import { useApp } from "@/hooks/useApp";
import { hashPassword, isValidEmail, recoveryCode } from "@/services/account";
import { Button, Card, Modal } from "@/components/ui";
import { Icon } from "@/components/Icons";

type Step = "email" | "code" | "done";

export function AccountSection() {
  const { state, updateProfile, toast } = useApp();
  const [email, setEmail] = useState(state.email);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [saving, setSaving] = useState(false);

  // Recuperação de senha
  const [recOpen, setRecOpen] = useState(false);
  const [step, setStep] = useState<Step>("email");
  const [recEmail, setRecEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPw, setNewPw] = useState("");
  const [genCode, setGenCode] = useState("");
  const [err, setErr] = useState("");

  const hasAccount = state.email.trim().length > 0;

  const save = async () => {
    if (!isValidEmail(email)) {
      toast("Esse email não parece válido…", "warning");
      return;
    }
    if (pw && pw.length < 4) {
      toast("A senha precisa de pelo menos 4 caracteres", "warning");
      return;
    }
    if (pw !== pw2) {
      toast("As senhas não conferem", "warning");
      return;
    }
    setSaving(true);
    const hash = pw ? await hashPassword(pw) : state.passwordHash;
    updateProfile({ email, passwordHash: hash });
    setSaving(false);
    setPw("");
    setPw2("");
    toast("Conta salva! Agora dá pra recuperar a senha pelo email.", "sealCheck");
  };

  const sendCode = () => {
    setErr("");
    if (recEmail.trim().toLowerCase() !== state.email.trim().toLowerCase()) {
      setErr("Esse email não está cadastrado aqui… confere aí?");
      return;
    }
    const c = recoveryCode();
    setGenCode(c);
    setStep("code");
  };

  const resetPw = async () => {
    setErr("");
    if (code.trim() !== genCode) {
      setErr("Código errado. Tenta de novo!");
      return;
    }
    if (newPw.length < 4) {
      setErr("A nova senha precisa de pelo menos 4 caracteres");
      return;
    }
    const hash = await hashPassword(newPw);
    updateProfile({ passwordHash: hash });
    setStep("done");
    setCode("");
    setNewPw("");
  };

  return (
    <Card className="mt-3">
      <div className="section-title" style={{ marginTop: 0 }}>
        <Icon name="shield" size={18} /> Minha conta
      </div>
      <p className="muted small" style={{ margin: "4px 0 12px" }}>
        {hasAccount
          ? `Cadastrada como ${state.email} — recupere a senha se esquecer.`
          : "Cadastre um email e senha para conseguir recuperar sua conta."}
      </p>

      <label className="small muted bold" style={{ display: "block", marginBottom: 6 }}>
        Email
      </label>
      <input
        className="text-input"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="voce@exemplo.com"
        aria-label="Email"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
      />

      <div className="row mt-3" style={{ gap: 10 }}>
        <div className="grow">
          <label className="small muted bold" style={{ display: "block", marginBottom: 6 }}>
            Senha {hasAccount ? "(nova, se quiser trocar)" : ""}
          </label>
          <input
            className="text-input"
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="••••••"
            aria-label="Senha"
            autoComplete="new-password"
          />
        </div>
        <div className="grow">
          <label className="small muted bold" style={{ display: "block", marginBottom: 6 }}>
            Repetir senha
          </label>
          <input
            className="text-input"
            type="password"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            placeholder="••••••"
            aria-label="Repetir senha"
            autoComplete="new-password"
          />
        </div>
      </div>

      <div className="row mt-3">
        <Button variant="soft" className="grow" onClick={save} disabled={saving}>
          <Icon name="sealCheck" size={15} /> {saving ? "Salvando…" : "Salvar conta"}
        </Button>
        <Button variant="ghost" onClick={() => { setStep("email"); setErr(""); setRecEmail(""); setRecOpen(true); }}>
          Esqueci a senha
        </Button>
      </div>

      {/* Modal de recuperação */}
      <Modal open={recOpen} onClose={() => setRecOpen(false)} title="Recuperar senha">
        {step === "email" && (
          <>
            <p className="small muted">
              Digite o email cadastrado. Se estiver certo, liberamos a redefinição.
            </p>
            <input
              className="text-input"
              type="email"
              value={recEmail}
              onChange={(e) => setRecEmail(e.target.value)}
              placeholder="seu email cadastrado"
              aria-label="Email cadastrado"
            />
            {err && <p className="small" style={{ color: "var(--c-red)", margin: "8px 0 0" }}>{err}</p>}
            <Button className="mt-3" block onClick={sendCode}>
              Liberar redefinição
            </Button>
          </>
        )}

        {step === "code" && (
          <>
            <p className="small muted">
              Email confirmado ! Seu código de recuperação (simulação do email):
            </p>
            <div className="center bold" style={{ fontSize: "1.6rem", letterSpacing: 6, color: "var(--c-primary)", margin: "8px 0" }}>
              {genCode}
            </div>
            <input
              className="text-input"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              aria-label="Código"
              inputMode="numeric"
            />
            <input
              className="text-input mt-3"
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="Nova senha"
              aria-label="Nova senha"
            />
            {err && <p className="small" style={{ color: "var(--c-red)", margin: "8px 0 0" }}>{err}</p>}
            <Button className="mt-3" block onClick={resetPw}>
              Redefinir senha
            </Button>
          </>
        )}

        {step === "done" && (
          <div className="center">
            <Icon name="sealCheck" size={40} style={{ color: "var(--c-green)" }} />
            <p className="small mt-2">Senha redefinida com sucesso ! Agora é só usar a nova.</p>
            <Button className="mt-3" block onClick={() => { setRecOpen(false); setStep("email"); }}>
              Fechar
            </Button>
          </div>
        )}
      </Modal>
    </Card>
  );
}
