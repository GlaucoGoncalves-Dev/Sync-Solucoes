'use client';
import { useEffect, useState } from 'react';
import { Mark } from '../components/Mark';
import { PROJETOS_INICIAIS, Projeto, STORAGE_KEY, getThumbnailForUrl } from '../projetos-data';

const CATEGORIAS = [
  'Site Institucional & Portfólio',
  'Landing Page',
  'SaaS & Landing Page',
  'Sistema Web / Gestão',
  'CRM & Automação IA',
  'E-commerce',
];

const SESSION_KEY = 'sync_admin_session_v1';
const CUSTOM_HASH_KEY = 'sync_admin_pwd_hash_v1';
const LOCKOUT_KEY = 'sync_admin_lockout_v1';
const DEFAULT_HASH = 'b4d5fa1ffd362b054a918958ddfbfb1dcfb9b05b4f032e28d65e244f7984eca7';
const VALID_USERS = ['admin', 'syncsolucoesbr@gmail.com'];

async function sha256Salted(pwd: string): Promise<string> {
  const data = new TextEncoder().encode('sync-salt-v1:' + pwd);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function normalizeUrl(input: string): { url: string; dominio: string } {
  const clean = input.trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
  const dominio = clean.replace(/^www\./i, '');
  return { url: `https://${clean}`, dominio };
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginPwd, setLoginPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loginErr, setLoginErr] = useState('');
  const [attempts, setAttempts] = useState(0);

  const [showPwdModal, setShowPwdModal] = useState(false);
  const [newPwd, setNewPwd] = useState('');
  const [newPwdConfirm, setNewPwdConfirm] = useState('');
  const [pwdErr, setPwdErr] = useState('');

  const [projetos, setProjetos] = useState<Projeto[]>(PROJETOS_INICIAIS);
  const [editId, setEditId] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [descricao, setDescricao] = useState('');
  const [imagem, setImagem] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    try {
      const token = sessionStorage.getItem(SESSION_KEY);
      const expected = localStorage.getItem(CUSTOM_HASH_KEY) || DEFAULT_HASH;
      if (token && token === expected) setAuthed(true);
    } catch {}
    setAuthChecked(true);
  }, []);

  useEffect(() => {
    if (!authed) return;
    const load = async () => {
      try {
        const res = await fetch('/projetos.json', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setProjetos(data);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            return;
          }
        }
      } catch {}
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) setProjetos(parsed);
        }
      } catch {}
    };
    load();
  }, [authed]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErr('');
    try {
      const lockUntil = +(localStorage.getItem(LOCKOUT_KEY) || 0);
      if (Date.now() < lockUntil) {
        const secs = Math.ceil((lockUntil - Date.now()) / 1000);
        setLoginErr(`Muitas tentativas. Aguarde ${secs}s para tentar novamente.`);
        return;
      }
    } catch {}

    const userClean = loginUser.trim().toLowerCase();
    const hash = await sha256Salted(loginPwd);
    const expected = localStorage.getItem(CUSTOM_HASH_KEY) || DEFAULT_HASH;

    if (VALID_USERS.includes(userClean) && hash === expected) {
      sessionStorage.setItem(SESSION_KEY, hash);
      setAuthed(true);
      setLoginPwd('');
      setAttempts(0);
    } else {
      const nextAtt = attempts + 1;
      setAttempts(nextAtt);
      if (nextAtt >= 5) {
        try { localStorage.setItem(LOCKOUT_KEY, String(Date.now() + 60000)); } catch {}
        setLoginErr('5 tentativas incorretas. Acesso bloqueado por 60 segundos.');
      } else {
        setLoginErr('Usuário ou senha inválidos.');
      }
    }
  };

  const handleLogout = () => {
    try { sessionStorage.removeItem(SESSION_KEY); } catch {}
    setAuthed(false);
    setLoginPwd('');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdErr('');
    if (newPwd.length < 6) {
      setPwdErr('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (newPwd !== newPwdConfirm) {
      setPwdErr('A confirmação de senha não confere.');
      return;
    }
    const hash = await sha256Salted(newPwd);
    localStorage.setItem(CUSTOM_HASH_KEY, hash);
    sessionStorage.setItem(SESSION_KEY, hash);
    setNewPwd('');
    setNewPwdConfirm('');
    setShowPwdModal(false);
    setStatusMsg('Senha alterada com sucesso neste navegador.');
    setTimeout(() => setStatusMsg(''), 3200);
  };

  const persist = async (next: Projeto[], msg: string) => {
    setProjetos(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
    let savedServer = false;
    try {
      const token = sessionStorage.getItem(SESSION_KEY) || '';
      const res = await fetch('/api/projetos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
        body: JSON.stringify(next, null, 2),
      });
      savedServer = res.ok;
    } catch {}
    setStatusMsg(savedServer ? msg : `${msg} (Salvo localmente — use Exportar JSON para deploy estático)`);
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const limparForm = () => {
    setEditId(null);
    setNome('');
    setUrlInput('');
    setCategoria(CATEGORIAS[0]);
    setDescricao('');
    setImagem('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !urlInput.trim()) return;
    const { url, dominio } = normalizeUrl(urlInput);
    if (editId) {
      const next = projetos.map(p =>
        p.id === editId
          ? { ...p, nome: nome.trim(), url, dominio, categoria, descricao: descricao.trim(), imagem: imagem.trim() }
          : p
      );
      persist(next, 'Projeto atualizado com sucesso!');
    } else {
      const id = dominio.replace(/[^a-z0-9]/gi, '-').toLowerCase() + '-' + Date.now().toString(36);
      const novo: Projeto = {
        id,
        nome: nome.trim(),
        dominio,
        url,
        categoria,
        descricao: descricao.trim() || `Projeto desenvolvido pela Sync Soluções (${dominio}).`,
        imagem: imagem.trim(),
        ativo: true,
      };
      persist([...projetos, novo], 'Novo projeto cadastrado e publicado!');
    }
    limparForm();
  };

  const handleEdit = (p: Projeto) => {
    setEditId(p.id);
    setNome(p.nome);
    setUrlInput(p.dominio || p.url);
    setCategoria(p.categoria);
    setDescricao(p.descricao);
    setImagem(p.imagem);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggle = (id: string) => {
    const next = projetos.map(p => (p.id === id ? { ...p, ativo: !p.ativo } : p));
    persist(next, 'Visibilidade do projeto atualizada.');
  };

  const handleDelete = (p: Projeto) => {
    if (!window.confirm(`Deseja realmente excluir o projeto "${p.nome}" (${p.dominio})?`)) return;
    const next = projetos.filter(x => x.id !== p.id);
    persist(next, 'Projeto removido.');
    if (editId === p.id) limparForm();
  };

  const handleRestoreDefaults = () => {
    if (!window.confirm('Deseja restaurar a lista de projetos padrão? Alterações personalizadas serão substituídas.')) return;
    persist(PROJETOS_INICIAIS, 'Projetos padrão restaurados!');
  };

  const handleMove = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= projetos.length) return;
    const next = [...projetos];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    persist(next, 'Ordem dos projetos atualizada.');
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(projetos, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'projetos.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  if (!authChecked) return null;

  if (!authed) {
    return (
      <div className="login-wrap">
        <div className="login-card">
          <div className="login-brand">
            <Mark size={36} />
            <span>SYNC ADMIN</span>
          </div>
          <h1>Acesso Restrito</h1>
          <p className="sub">Entre com suas credenciais de administrador para gerenciar os projetos publicados.</p>
          {loginErr && <div className="login-error" role="alert">{loginErr}</div>}
          <form onSubmit={handleLogin} className="admin-form">
            <label>
              <span>Usuário ou E-mail</span>
              <input
                type="text"
                required
                autoComplete="username"
                placeholder="admin ou syncsolucoesbr@gmail.com"
                value={loginUser}
                onChange={e => setLoginUser(e.target.value)}
              />
            </label>
            <label>
              <span>Senha</span>
              <div className="pwd-row">
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={loginPwd}
                  onChange={e => setLoginPwd(e.target.value)}
                />
                <button type="button" className="pwd-toggle" onClick={() => setShowPwd(!showPwd)}>
                  {showPwd ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </label>
            <button type="submit" className="btn" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
              Entrar no Painel
            </button>
            <a href="/" className="again" style={{ textDecoration: 'none' }}>
              Voltar ao site público
            </a>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <header className="nav solid">
        <div className="wrap">
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <Mark size={36} />
            <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 16 }}>SYNC ADMIN</span>
          </a>
          <nav aria-label="Admin">
            <button type="button" className="btn ghost" style={{ minHeight: 40, fontSize: 14, padding: '0 16px' }} onClick={() => { setPwdErr(''); setShowPwdModal(!showPwdModal); }}>
              Alterar Senha
            </button>
            <button type="button" className="btn ghost" style={{ minHeight: 40, fontSize: 14, padding: '0 16px' }} onClick={handleExport}>
              Exportar JSON
            </button>
            <a className="btn" href="/#projetos" style={{ minHeight: 40, fontSize: 14, padding: '0 18px' }}>
              Ver site
            </a>
            <button type="button" className="btn ghost danger" style={{ minHeight: 40, fontSize: 14, padding: '0 16px' }} onClick={handleLogout}>
              Sair
            </button>
          </nav>
        </div>
      </header>

      <main className="wrap admin-main">
        <div className="admin-header">
          <h1 className="h2">Gerenciar Projetos Publicados</h1>
          <p style={{ color: 'var(--text-2)', marginTop: 10 }}>
            Cadastre ou edite sites, landing pages e sistemas entregues pela Sync. As alterações aparecem imediatamente na seção <strong>Projetos</strong> da página principal.
          </p>
          {statusMsg && <div className="admin-toast" role="status">{statusMsg}</div>}
        </div>

        {showPwdModal && (
          <section className="admin-card" style={{ position: 'static', marginBottom: 32, maxWidth: 480 }}>
            <h2 className="admin-card-title">Alterar Senha do Admin</h2>
            {pwdErr && <div className="login-error" role="alert">{pwdErr}</div>}
            <form onSubmit={handleChangePassword} className="admin-form">
              <label>
                <span>Nova senha (mín. 6 caracteres)</span>
                <input type="password" required minLength={6} value={newPwd} onChange={e => setNewPwd(e.target.value)} />
              </label>
              <label>
                <span>Confirmar nova senha</span>
                <input type="password" required minLength={6} value={newPwdConfirm} onChange={e => setNewPwdConfirm(e.target.value)} />
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn" style={{ minHeight: 42, fontSize: 14 }}>Salvar nova senha</button>
                <button type="button" className="btn ghost" style={{ minHeight: 42, fontSize: 14 }} onClick={() => setShowPwdModal(false)}>Cancelar</button>
              </div>
            </form>
          </section>
        )}

        <div className="admin-grid">
          <section className="admin-card" aria-labelledby="formTitle">
            <h2 id="formTitle" className="admin-card-title">
              {editId ? 'Editar projeto' : 'Cadastrar novo projeto'}
            </h2>
            <form onSubmit={handleSubmit} className="admin-form">
              <label>
                <span>Nome do Projeto / Cliente *</span>
                <input type="text" required placeholder="Ex: JMeuren Arquitetura" value={nome} onChange={e => setNome(e.target.value)} />
              </label>
              <label>
                <span>Domínio ou URL *</span>
                <input type="text" required placeholder="Ex: jmeurenarquitetura.com.br" value={urlInput} onChange={e => setUrlInput(e.target.value)} />
              </label>
              <label>
                <span>Categoria</span>
                <select value={categoria} onChange={e => setCategoria(e.target.value)}>
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label>
                <span>Descrição curta</span>
                <textarea rows={3} placeholder="Resumo do que foi construído para o cliente..." value={descricao} onChange={e => setDescricao(e.target.value)} />
              </label>
              <label>
                <span>Imagem de Capa (opcional — automático se vazio)</span>
                <input type="text" placeholder="Ex: /m/proj-jmeuren.jpg ou deixe em branco" value={imagem} onChange={e => setImagem(e.target.value)} />
              </label>
              <div className="admin-form-actions">
                <button type="submit" className="btn" style={{ width: '100%', justifyContent: 'center' }}>
                  {editId ? 'Salvar alterações' : '+ Publicar projeto'}
                </button>
                {editId && (
                  <button type="button" className="btn ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={limparForm}>
                    Cancelar edição
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="admin-list-sec" aria-labelledby="listTitle">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 id="listTitle" className="admin-card-title" style={{ margin: 0 }}>
                Projetos cadastrados ({projetos.length})
              </h2>
              <button type="button" className="btn ghost" style={{ minHeight: 36, fontSize: 13, padding: '0 14px' }} onClick={handleRestoreDefaults}>
                Restaurar padrão
              </button>
            </div>

            <div className="admin-list">
              {projetos.map((p, idx) => (
                <article key={p.id} className={'admin-item' + (!p.ativo ? ' off' : '')}>
                  <div className="admin-item-thumb">
                    <img
                      src={getThumbnailForUrl(p.url, p.imagem)}
                      alt={p.nome}
                      loading="lazy"
                      onError={e => { (e.currentTarget as HTMLImageElement).src = '/m/hero-poster.jpg'; }}
                    />
                  </div>
                  <div className="admin-item-body">
                    <div className="admin-item-top">
                      <span className="proj-tag">{p.categoria}</span>
                      <span className={'admin-status' + (p.ativo ? ' on' : '')}>
                        {p.ativo ? 'Publicado' : 'Oculto'}
                      </span>
                    </div>
                    <h3>{p.nome}</h3>
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="admin-domain">
                      {p.dominio}
                    </a>
                    <p>{p.descricao}</p>
                    <div className="admin-item-actions">
                      <button type="button" className="btn ghost" onClick={() => handleEdit(p)}>Editar</button>
                      <button type="button" className="btn ghost" onClick={() => handleToggle(p.id)}>
                        {p.ativo ? 'Ocultar' : 'Publicar'}
                      </button>
                      <button type="button" className="btn ghost" disabled={idx === 0} onClick={() => handleMove(idx, -1)} aria-label="Mover para cima">Subir</button>
                      <button type="button" className="btn ghost" disabled={idx === projetos.length - 1} onClick={() => handleMove(idx, 1)} aria-label="Mover para baixo">Descer</button>
                      <button type="button" className="btn ghost danger" onClick={() => handleDelete(p)}>Excluir</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
