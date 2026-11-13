import { Mark } from './components/Mark';
import { Loader } from './components/Loader';
import { HeroVideo } from './components/HeroVideo';
import { ScrollEffects } from './components/ScrollEffects';
import { Segure } from './components/Segure';
import { Projetos } from './components/Projetos';
import { CopyEmail } from './components/CopyEmail';
import { EMAIL } from './contato';

const QUEM = 'Oi. A Sync existe para colocar a sua empresa em ordem. Sem pacote pronto e sem trocar tudo de uma vez. O trabalho começa pelo que você já usa hoje e vai juntando as partes até a rotina andar sozinha.';

const DORES = [
  'O cliente mandou mensagem e ninguém viu. Ficou lá embaixo no celular, entre outras cinquenta conversas.',
  'O pedido está anotado. Em algum lugar. No caderno, num papel, no celular de quem atendeu.',
  'A conta da empresa saiu da sua conta.',
  'E no fim do mês ninguém sabe direito quanto entrou e quanto saiu.',
];

const AREAS = [
  { slug: 'gestao', nome: 'Gestão', texto: 'Gestão completa: agenda, financeiro e recebimentos em um só lugar.' },
  { slug: 'crm', nome: 'CRM', texto: 'Atendimento no WhatsApp e Instagram com agente de IA que agenda de verdade.' },
  { slug: 'financas', nome: 'Finanças', texto: 'Controle financeiro e emissão de nota em um só lugar.' },
  { slug: 'arquitetura', nome: 'Arquitetura & Engenharia', texto: 'Sistema de pré-análise e validação técnica de projetos para aprovação.' },
  { slug: 'sites', nome: 'Sites & Landing Pages', texto: 'Sites institucionais, landing pages de alta conversão e sistemas web sob medida.' },
];

const PERGUNTAS = [
  { q: 'Como funciona?', a: 'Você fala com a Sync, a gente entende a sua rotina e constrói o sistema, site ou landing page. O trabalho começa pelo que você já usa hoje.' },
  { q: 'Preciso trocar tudo que uso hoje?', a: 'Não. Nada de pacote pronto nem troca de uma vez — as partes vão se juntando até a rotina andar sozinha.' },
  { q: 'E se eu não entender de tecnologia?', a: 'Você não precisa entender. A Sync constrói, entrega funcionando e acompanha.' },
  { q: 'Para que tipo de empresa?', a: 'Para pequenas e médias empresas.' },
];

export default function Page() {
  return (
    <>
      <a className="skip" href="#quem">Pular para o conteúdo</a>
      <Loader />

      <header className="nav" id="nav">
        <div className="wrap">
          <a href="#topo" aria-label="Sync Soluções, voltar ao topo" style={{ display: 'flex' }}><Mark /></a>
          <nav aria-label="Principal">
            <a className="txt" href="#areas">Áreas</a>
            <a className="txt" href="#projetos">Projetos</a>
            <a className="txt" href="#perguntas">Perguntas</a>
            <a className="btn" href="#fechamento">Contato</a>
          </nav>
        </div>
      </header>

      <main>
        <section id="topo" aria-label="Topo">
          <div className="hero-pin">
            <div className="hero-media" id="heroMedia" data-flyover="hero"><HeroVideo /></div>
            <div className="hero-title" id="heroTitle"><div className="wrap">
              <h1>
                <span>SYNC</span>
                <span>SOLUÇÕES<i className="dot" aria-hidden="true" /></span>
                <span className="sub">Sistemas sob medida, sites, landing pages e automação para sua empresa rodar em sincronia.</span>
              </h1>
            </div></div>
            <div className="hero-cue" aria-hidden="true">
              <span>ROLE</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2v8M2.5 6.5 6 10l3.5-3.5" />
              </svg>
            </div>
          </div>
        </section>

        <section id="quem" className="sec" aria-label="Quem">
          <div className="wrap">
            <p className="quem" id="quemText" data-flyover="second-title" aria-label={QUEM}>
              {QUEM.split(' ').map((w, i) => <span key={i} aria-hidden="true"><span className={'w' + (i === 0 ? ' oi' : '')}>{w}</span>{' '}</span>)}
            </p>
          </div>
        </section>

        <section id="rotina" className="sec" aria-labelledby="rotinaT" style={{ paddingTop: 0 }}>
          <div className="wrap rotina-grid">
            <div className="rotina-head" data-rise="">
              <h2 className="h2" id="rotinaT">Tudo funciona. Só que espalhado.</h2>
              <p className="rotina-sub">Conhece essa rotina no dia a dia da empresa?</p>
            </div>
            <div>
              <ul className="dores">
                {DORES.map((d, i) => (
                  <li key={d} className="dor" data-rise="" data-lit="" data-flyover="card">
                    <small>0{i + 1}</small>
                    {d}
                  </li>
                ))}
              </ul>
              <p className="fecho" data-rise="">A rotina da empresa acompanhada num lugar só.</p>
            </div>
          </div>
        </section>

        <section id="areas" className="sec" aria-labelledby="areasT" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="sec-head" data-rise="">
              <h2 className="h2" id="areasT">Onde a Sync entra na sua operação.</h2>
              <p className="sec-sub">Da organização interna à presença digital, cada frente conversa com o restante da empresa.</p>
            </div>
            <div className="areas">
              {AREAS.map((a, i) => (
                <article key={a.slug} className="area" data-rise="" data-stagger={i} data-flyover="card">
                  <div className="media"><video data-loop="" src={`/m/area-${a.slug}.mp4`} poster={`/m/area-${a.slug}.jpg`} muted playsInline loop preload="metadata" aria-hidden="true" /></div>
                  <div className="body"><h3>{a.nome}</h3><p>{a.texto}</p></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <Projetos />

        <Segure />

        <section id="perguntas" className="sec" aria-labelledby="perguntasT" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <h2 className="h2" id="perguntasT" data-rise="">Perguntas frequentes.</h2>
            <div className="faq" data-rise="">
              {PERGUNTAS.map((p, i) => (
                <details key={p.q} open={i === 0} data-flyover="card"><summary>{p.q}</summary><p>{p.a}</p></details>
              ))}
            </div>
          </div>
        </section>

        <section id="fechamento" className="sec" aria-labelledby="fechT">
          <div className="wrap">
            <h2 className="h2" id="fechT" data-rise="" data-flyover="footer-title">Bora colocar a sua empresa em sincronia?</h2>
            <div className="contact-stack" data-rise="">
              <div className="contact-primary">
                <a className="btn" href={`mailto:${EMAIL}`}>Fale com a Sync.</a>
              </div>
              <div className="contact-secondary">
                <span className="mail" id="mail">{EMAIL}</span>
                <CopyEmail />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap">
          <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}><Mark size={28} /><span style={{ color: 'var(--text)', fontWeight: 500 }}>Sync Soluções</span></span>
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          <span>© 2026 Sync Soluções</span>
        </div>
      </footer>

      <ScrollEffects />
    </>
  );
}
