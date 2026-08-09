import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Boxes,
  Building2,
  Camera,
  Check,
  ChevronLeft,
  CircleDollarSign,
  FileCheck2,
  FileText,
  GraduationCap,
  LockKeyhole,
  MapPinned,
  Menu,
  Moon,
  Plane,
  ReceiptText,
  ScanLine,
  Search,
  Sparkles,
  Sun,
  UsersRound,
  WalletCards,
  X,
} from 'lucide-react';

type Theme = 'light' | 'dark';
type InfoPage = 'privacy' | 'terms' | 'cookies' | 'help';

const INFO_PAGES: Record<InfoPage, { title: string; intro: string; sections: Array<[string, string]> }> = {
  privacy: {
    title: 'Politika privatnosti',
    intro: 'Kako Putni nalozi obrađuju i štite podatke koje unesete.',
    sections: [
      ['Podaci koje obrađujemo', 'Obrađujemo podatke računa i putnih naloga koje unesete: kontakt podatke, podatke organizacije, rute, datume putovanja, troškove, slike računa i podatke potrebne za prijavu.'],
      ['Svrha obrade', 'Podatke koristimo za kreiranje, obračun, dijeljenje i izvoz putnih naloga, sigurnost usluge i korisničku podršku. Slike računa mogu se poslati AI servisu samo kada pokrenete očitavanje.'],
      ['Čuvanje i dijeljenje', 'Podatke ne prodajemo. Dijelimo ih samo s pružaocima infrastrukture i obrade potrebnima za rad usluge, s vašom organizacijom kada koristite timski prostor ili kada to zahtijeva zakon.'],
      ['Vaša prava', 'Možete zatražiti pristup, ispravku, brisanje ili ograničenje obrade podataka kada je to primjenjivo.'],
    ],
  },
  terms: {
    title: 'Uslovi korištenja',
    intro: 'Pravila korištenja aplikacije Putni nalozi.',
    sections: [
      ['Namjena usluge', 'Putni nalozi su poslovni alat za pripremu, evidenciju i obračun putnih naloga i troškova. Korisnik je odgovoran za tačnost unesenih podataka i potrebna odobrenja unutar organizacije.'],
      ['AI očitavanje', 'AI očitavanje je pomoćna funkcija. Prije slanja ili izvoza pregledajte očitane datume, iznose, kategorije i obračune. Aplikacija ne zamjenjuje računovodstvenu, poresku ni pravnu provjeru.'],
      ['Korisnički račun', 'Čuvajte pristupne podatke i ne dijelite račun s neovlaštenim osobama.'],
      ['Dostupnost', 'Uslugu možemo mijenjati, održavati ili privremeno ograničiti radi sigurnosti i unapređenja.'],
    ],
  },
  cookies: {
    title: 'Politika kolačića',
    intro: 'Kako koristimo kolačiće na qla.dev Business web stranici.',
    sections: [
      ['Neophodni kolačići', 'Koristimo neophodne kolačiće i slične tehnologije za sigurnost, održavanje sesije i osnovni rad web stranice.'],
      ['Opcionalni kolačići', 'Trenutno ne koristimo kolačiće za oglašavanje. Ako uvedemo opcionalne analitičke kolačiće, zatražit ćemo odgovarajući pristanak prije njihovog postavljanja.'],
      ['Upravljanje kolačićima', 'Kolačiće možete obrisati ili blokirati u postavkama preglednika. Blokiranje neophodnih kolačića može uticati na rad stranice.'],
    ],
  },
  help: {
    title: 'Pravilnik i pomoć',
    intro: 'Kratko uputstvo za svakodnevni rad u Putnim nalozima.',
    sections: [
      ['1. Kreirajte putni nalog', 'Odaberite rutu i način putovanja, pa provjerite datum i vrijeme polaska i povratka. Dnevnica se računa prema trajanju i udaljenosti.'],
      ['2. Dodajte troškove i račune', 'Otvorite Dodaj trošak, fotografišite račun ili ga odaberite iz galerije, zatim pregledajte podatke koje je AI očitao prije dodavanja.'],
      ['3. Privatno vozilo', 'U Transportu odaberite privatno vozilo. U stavci Tura provjerite kilometražu i po potrebi izmijenite cijenu BMB95. Naknada je km × (BMB95 × 0,15).'],
      ['4. Pregled i slanje', 'Provjerite dnevnice, troškove, akontaciju i iznos za isplatu prije slanja naloga na odobrenje.'],
    ],
  },
};

const modules = [
  {
    name: 'Putni nalozi',
    description: 'Službena putovanja, računi, dnevnice i timska kontrola u jednoj mobilnoj aplikaciji.',
    status: 'Dostupno u beta verziji',
    iconSrc: '/assets/putni-nalozi-icon.png',
    active: true,
  },
  {
    name: 'Radno vrijeme',
    description: 'Evidencija rada, odsustava, smjena i odobrenja bez odvojenih tabela.',
    status: 'U pripremi',
    iconSrc: '/assets/module-radno-vrijeme.png',
  },
  {
    name: 'Troškovi',
    description: 'Prikupljanje, kategorizacija i pregled poslovnih troškova kroz cijeli tim.',
    status: 'U pripremi',
    iconSrc: '/assets/module-troskovi.png',
  },
  {
    name: 'Dokumenti',
    description: 'Siguran tok dokumenata, od prvog nacrta do potpisa i arhive.',
    status: 'U pripremi',
    iconSrc: '/assets/module-dokumenti.png',
  },
  {
    name: 'Projekti',
    description: 'Zadaci, rokovi, ljudi i troškovi projekta u zajedničkom poslovnom kontekstu.',
    status: 'U pripremi',
    iconSrc: '/assets/module-projekti.png',
  },
  {
    name: 'Izvještaji',
    description: 'Jedan pregled ključnih podataka iz svih aktivnih Business aplikacija.',
    status: 'U pripremi',
    iconSrc: '/assets/module-izvjestaji.png',
  },
];

const phoneViews = [
  {
    eyebrow: 'Putni nalozi',
    title: 'Sve obaveze na jednom mjestu',
    description: 'Pregled naloga, statusa i troškova koji ostaje jasan i kada tim raste.',
  },
  {
    eyebrow: 'AI skener',
    title: 'Račun postaje podatak',
    description: 'Fotografišite račun, provjerite očitane stavke i povežite ga s nalogom.',
  },
  {
    eyebrow: 'Timski rad',
    title: 'Kontrola bez usporavanja',
    description: 'Vlasnik prati potrošnju i naloge članova, a tim radi u istom toku.',
  },
];

const rollingModules = [
  'Putni nalozi',
  'AI obrada računa',
  'Timski rad',
  'Pametni izvještaji',
  'Mobilne aplikacije',
  'Zajednički identitet',
];

const exportOptions = [
  { name: 'PDF', format: 'Dokument', Icon: FileText },
  { name: 'PANTHEON', format: 'XML', imageSrc: '/assets/export-pantheon.png' },
  { name: 'ŠPICA', format: 'CSV', imageSrc: '/assets/export-spica.png' },
  { name: 'OPTION', format: 'CSV', Icon: Building2 },
  { name: 'SKULA', format: 'XLSX', Icon: GraduationCap },
];

const appShowcaseViews = [
  {
    key: 'orders',
    label: 'Nalozi i statusi',
    title: 'Svaki putni nalog odmah na svom mjestu.',
    description: 'Filtrirajte nacrte, poslane i odobrene naloge, otvorite detalje ili pokrenite izvoz bez traženja po tabelama.',
    Icon: FileText,
  },
  {
    key: 'detail',
    label: 'Ruta i obračun',
    title: 'Cijeli službeni put u jednom pregledu.',
    description: 'Ruta, trajanje, dnevnica, prijevoz, računi i ukupan iznos ostaju povezani s istim nalogom.',
    Icon: MapPinned,
  },
  {
    key: 'scanner',
    label: 'AI obrada računa',
    title: 'Fotografija računa postaje spreman trošak.',
    description: 'Kamera prepoznaje iznos, datum, prodajno mjesto i kategoriju, a korisnik samo provjeri rezultat.',
    Icon: ScanLine,
  },
  {
    key: 'analytics',
    label: 'Poslovni pregled',
    title: 'Troškovi i statusi bez ručnog sabiranja.',
    description: 'Ukupna potrošnja, broj naloga i raspodjela troškova daju vlasniku brzu sliku poslovnih putovanja.',
    Icon: BarChart3,
  },
];

function ShowcaseScreen({ type }: { type: string }) {
  const bottomTabs = (
    <div className="showcase-tabs">
      <Plane size={14} />
      <ScanLine size={14} />
      <BarChart3 size={14} />
      <UsersRound size={14} />
    </div>
  );

  if (type === 'detail') {
    return (
      <>
        <div className="showcase-native-header">
          <ChevronLeft size={15} />
          <b>PN-2026-031</b>
          <span>•••</span>
        </div>
        <div className="showcase-screen-scroll">
          <div className="showcase-detail-title">
            <span>Odobreno</span>
            <h4>Sarajevo → Mostar</h4>
            <small>18. juli do 20. juli 2026.</small>
          </div>
          <div className="mini-route-map">
            <i className="route-road route-road-one" />
            <i className="route-road route-road-two" />
            <span className="route-point route-start" />
            <span className="route-point route-end" />
            <b>144 km</b>
          </div>
          <div className="mini-total-card">
            <span><small>Ukupno</small><b>486,40 KM</b></span>
            <CircleDollarSign size={21} />
          </div>
          <div className="mini-section-label">Obračun naloga</div>
          <div className="mini-detail-list">
            <span><i>Dnevnice</i><b>150,00 KM</b></span>
            <span><i>Prijevoz</i><b>112,40 KM</b></span>
            <span><i>Troškovi (3)</i><b>224,00 KM</b></span>
          </div>
        </div>
        {bottomTabs}
      </>
    );
  }

  if (type === 'scanner') {
    return (
      <>
        <div className="showcase-native-header">
          <span />
          <b>AI skener</b>
          <span />
        </div>
        <div className="showcase-screen-scroll scanner-phone-screen">
          <div className="mini-camera">
            <span><Camera size={27} /></span>
            <b>Skenirajte račun</b>
            <small>Fotografišite ili odaberite fotografiju</small>
            <i className="camera-corner corner-one" />
            <i className="camera-corner corner-two" />
            <i className="camera-corner corner-three" />
            <i className="camera-corner corner-four" />
          </div>
          <div className="mini-scan-result">
            <div><ReceiptText size={17} /><b>Račun prepoznat</b><em>98%</em></div>
            <span><small>Prodajno mjesto</small><b>Hotel Central</b></span>
            <span><small>Iznos</small><b>184,00 KM</b></span>
            <span><small>Kategorija</small><b>Smještaj</b></span>
          </div>
          <div className="mini-primary-button"><Check size={13} /> Dodaj u nalog</div>
        </div>
        {bottomTabs}
      </>
    );
  }

  if (type === 'analytics') {
    return (
      <>
        <div className="showcase-native-header">
          <span />
          <b>Pregled</b>
          <span />
        </div>
        <div className="showcase-screen-scroll">
          <div className="mini-wallet">
            <span><small>Ukupna vrijednost naloga</small><b>2.486,40 KM</b></span>
            <WalletCards size={22} />
            <em>12 putnih naloga</em>
          </div>
          <div className="mini-metrics">
            <span><small>Odobreno</small><b>8</b></span>
            <span><small>Čeka pregled</small><b>3</b></span>
          </div>
          <div className="mini-section-label">Troškovi po kategoriji</div>
          <div className="mini-bars">
            {[
              ['Smještaj', '82%'],
              ['Prijevoz', '61%'],
              ['Hrana', '43%'],
              ['Ostalo', '26%'],
            ].map(([label, width]) => (
              <span key={label}><i>{label}</i><b><em style={{ width }} /></b></span>
            ))}
          </div>
        </div>
        {bottomTabs}
      </>
    );
  }

  return (
    <>
      <div className="showcase-native-header">
        <span />
        <b>Putni nalozi</b>
        <Search size={14} />
      </div>
      <div className="showcase-screen-scroll">
        <div className="mini-filter"><b>Svi</b><span>Nacrti</span><span>Poslani</span><span>Odobreni</span></div>
        <div className="mini-order-list">
          {[
            ['PN-2026-031', 'Sarajevo → Mostar', 'Odobreno', '486,40 KM'],
            ['PN-2026-030', 'Sarajevo → Zagreb', 'Poslano', '712,20 KM'],
            ['PN-2026-029', 'Tuzla → Sarajevo', 'Nacrt', '168,00 KM'],
          ].map(([number, route, status, total]) => (
            <div className="mini-order" key={number}>
              <span><Plane size={13} /></span>
              <div><b>{number}</b><small>{route}</small><em>{status}</em></div>
              <strong>{total}</strong>
            </div>
          ))}
        </div>
        <div className="mini-create-order">+ Novi putni nalog</div>
      </div>
      {bottomTabs}
    </>
  );
}

function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('qla-business-theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#0a0d12' : '#ffffff');
    localStorage.setItem('qla-business-theme', theme);
  }, [theme]);

  return { theme, setTheme };
}

function ParticleField() {
  const particles = useMemo(
    () => Array.from({ length: 18 }, (_, index) => ({
      left: `${5 + ((index * 17) % 91)}%`,
      top: `${8 + ((index * 23) % 79)}%`,
      size: 2 + (index % 4),
      duration: 7 + (index % 6),
      delay: -(index % 8),
      drift: `${-34 + ((index * 13) % 70)}px`,
    })),
    [],
  );

  return (
    <div className="particles" aria-hidden="true">
      {particles.map((particle, index) => (
        <span
          key={index}
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
            '--drift': particle.drift,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

function PhoneScreen({ active }: { active: number }) {
  return (
    <div className={`phone phone-position-${active}`}>
      <div className="phone-island" />
      <div className="phone-screen">
        <div className="phone-status">
          <span>9:41</span>
          <span>● ●</span>
        </div>
        <div className="phone-brand-row">
          <img src="/assets/putni-nalozi-icon.png" alt="" />
          <div>
            <strong>Putni nalozi</strong>
            <span>qla.dev Business</span>
          </div>
        </div>
        <div className="phone-view-window">
          <div className="phone-view-track" style={{ transform: `translateX(-${active * 100}%)` }}>
            <div className="phone-view">
              <div className="phone-heading">Moji putni nalozi</div>
              <div className="phone-summary">
                <span><b>12</b> obrađeno</span>
                <span><b>68</b> preostalo</span>
              </div>
              {[
                ['PN-2026-031', 'Sarajevo → Mostar', 'U obradi'],
                ['PN-2026-030', 'Sarajevo → Zagreb', 'Odobreno'],
                ['PN-2026-029', 'Tuzla → Sarajevo', 'Nacrt'],
              ].map(([number, route, status]) => (
                <div className="order-row" key={number}>
                  <span className="order-icon"><Plane size={14} /></span>
                  <span><b>{number}</b><small>{route}</small></span>
                  <em>{status}</em>
                </div>
              ))}
            </div>
            <div className="phone-view scanner-view">
              <span className="scan-icon"><ScanLine size={28} /></span>
              <div className="phone-heading">Račun je očitan</div>
              <p>Provjerite podatke prije dodavanja u putni nalog.</p>
              <div className="receipt-card">
                <span><small>Prodajno mjesto</small><b>Hotel Central</b></span>
                <span><small>Iznos</small><b>184,00 BAM</b></span>
                <span><small>Kategorija</small><b>Smještaj</b></span>
              </div>
              <button><Check size={15} /> Dodaj u nalog</button>
            </div>
            <div className="phone-view">
              <div className="phone-heading">Moja firma</div>
              <div className="team-title">
                <span className="avatar">IK</span>
                <span><b>qla.dev</b><small>4 člana</small></span>
              </div>
              <div className="team-usage">
                <span>Dijeli AI tokene sa timom</span>
                <i />
              </div>
              {['Ivan Kovačić', 'Amina Hadžić', 'Haris Delić'].map((name, index) => (
                <div className="member-row" key={name}>
                  <span className={`avatar avatar-${index + 1}`}>{name.split(' ').map(word => word[0]).join('')}</span>
                  <span><b>{name}</b><small>{index === 0 ? 'Vlasnik' : 'Član tima'}</small></span>
                  <strong>{12 - index * 3}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="phone-tabs">
          <Plane size={17} />
          <ScanLine size={17} />
          <UsersRound size={17} />
        </div>
      </div>
    </div>
  );
}

function InformationPage({ page, theme, setTheme }: { page: InfoPage; theme: Theme; setTheme: (theme: Theme) => void }) {
  const content = INFO_PAGES[page];
  return <div className="site-shell information-shell">
    <header className="site-header information-header">
      <a className="brand" href="/" aria-label="qla.dev Business početna">
        <img className="brand-light" src="/assets/qla-business.png" alt="qla.dev Business" />
        <img className="brand-dark" src="/assets/qla-business-dark.png" alt="" />
      </a>
      <div className="header-actions">
        <button className="theme-toggle" type="button" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label="Promijeni temu">
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    </header>
    <main className="information-main">
      <span className="kicker">Putni nalozi · qla.dev Business</span>
      <h1>{content.title}</h1>
      <p className="information-intro">{content.intro}</p>
      <p className="information-updated">Posljednje ažuriranje: 9. august 2026.</p>
      <div className="information-card">
        {content.sections.map(([title, text]) => <section key={title}><h2>{title}</h2><p>{text}</p></section>)}
      </div>
    </main>
    <footer className="information-footer">
      <a href="/privacy">Privatnost</a><a href="/terms">Uslovi</a><a href="/cookies">Kolačići</a><a href="/help">Pravilnik i pomoć</a>
    </footer>
  </div>;
}

function App() {
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePhoneView, setActivePhoneView] = useState(0);
  const [activeShowcase, setActiveShowcase] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(
      () => setActivePhoneView(current => (current + 1) % phoneViews.length),
      3600,
    );
    return () => window.clearInterval(timer);
  }, []);

  const page = window.location.pathname.match(/^\/(privacy|terms|cookies|help)\/?$/)?.[1] as InfoPage | undefined;
  if (page) return <InformationPage page={page} theme={theme} setTheme={setTheme} />;

  useEffect(() => {
    const timer = window.setInterval(
      () => setActiveShowcase(current => (current + 1) % appShowcaseViews.length),
      4600,
    );
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('is-visible');
      }),
      { threshold: 0.12 },
    );
    document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#pocetna" aria-label="qla.dev Business početna">
          <img className="brand-light" src="/assets/qla-business.png" alt="qla.dev Business" />
          <img className="brand-dark" src="/assets/qla-business-dark.png" alt="" />
        </a>
        <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Glavna navigacija">
          <a href="#ekosistem" onClick={closeMenu}>Ekosistem</a>
          <a href="#putni-nalozi" onClick={closeMenu}>Putni nalozi</a>
          <a href="#principi" onClick={closeMenu}>Kako radi</a>
          <a href="#kontakt" onClick={closeMenu}>Kontakt</a>
        </nav>
        <div className="header-actions">
          <button
            className="theme-toggle"
            type="button"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            aria-label={theme === 'light' ? 'Uključi tamnu temu' : 'Uključi svijetlu temu'}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <a className="header-cta" href="#kontakt">Zatraži pristup</a>
          <button
            className="menu-toggle"
            type="button"
            onClick={() => setMenuOpen(open => !open)}
            aria-label={menuOpen ? 'Zatvori izbornik' : 'Otvori izbornik'}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <main>
        <section className="hero" id="pocetna">
          <ParticleField />
          <div className="hero-grid">
            <div className="hero-copy">
              <span className="eyebrow"><span /> Novi poslovni ekosistem iz qla.dev</span>
              <h1><span className="hero-title-nowrap">Business apps</span> koje rade kao <em>jedan tim.</em></h1>
              <p>
                qla.dev Business okuplja specijalizirane mobilne aplikacije za svakodnevni rad firme.
                Svaki modul rješava jedan posao odlično, a zajedno stvaraju povezanu cjelinu.
              </p>
              <div className="hero-actions">
                <a className="button button-primary" href="#putni-nalozi">
                  Upoznaj Putne naloge <ArrowRight size={17} />
                </a>
                <a className="button button-secondary" href="#ekosistem">Pogledaj ekosistem</a>
              </div>
              <div className="hero-proof">
                <span><Check size={14} /> Mobilno iskustvo</span>
                <span><Check size={14} /> Modularan sistem</span>
                <span><Check size={14} /> Podaci pod kontrolom</span>
              </div>
            </div>

            <div className="hero-visual" aria-label="Animirani prikaz aplikacije Putni nalozi">
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />
              <span className="orbit-chip chip-ai"><Sparkles size={15} /> AI obrada</span>
              <span className="orbit-chip chip-team"><UsersRound size={15} /> Timski rad</span>
              <span className="orbit-chip chip-export"><FileCheck2 size={15} /> Izvoz</span>
              <PhoneScreen active={activePhoneView} />
              <div className="phone-caption">
                <span>{phoneViews[activePhoneView].eyebrow}</span>
                <strong>{phoneViews[activePhoneView].title}</strong>
                <p>{phoneViews[activePhoneView].description}</p>
              </div>
              <div className="phone-controls" aria-label="Odabir prikaza telefona">
                {phoneViews.map((view, index) => (
                  <button
                    key={view.eyebrow}
                    className={index === activePhoneView ? 'active' : ''}
                    type="button"
                    onClick={() => setActivePhoneView(index)}
                    aria-label={`Prikaži: ${view.eyebrow}`}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="rolling-strip" aria-hidden="true">
            <div className="rolling-track">
              {[...rollingModules, ...rollingModules].map((item, index) => (
                <span key={`${item}-${index}`}><i /> {item}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="section ecosystem" id="ekosistem">
          <div className="section-heading reveal">
            <span className="kicker">Jedan poslovni identitet</span>
            <h2>Odaberite aplikacije koje trebate. <em>Dodajte nove kada porastete.</em></h2>
            <p>
              Bez ogromnog sistema koji tim mora učiti odjednom. qla.dev Business raste po modulima,
              sa zajedničkim načinom rada i jasnim iskustvom na svakom ekranu.
            </p>
          </div>
          <div className="module-grid">
            {modules.map(({ name, description, status, iconSrc, active }, index) => (
              <article
                className={`module-card reveal ${active ? 'module-active' : ''}`}
                style={{ transitionDelay: `${index * 55}ms` }}
                key={name}
              >
                <div className="module-icon">
                  <img src={iconSrc} alt="" />
                </div>
                <span className={active ? 'module-status status-live' : 'module-status'}>{status}</span>
                <h3>{name}</h3>
                <p>{description}</p>
                {active ? <a href="#putni-nalozi">Saznaj više <ArrowRight size={15} /></a> : <span className="future-link">Dio budućeg paketa</span>}
              </article>
            ))}
          </div>
        </section>

        <section className="section product-section" id="putni-nalozi">
          <div className="product-intro reveal">
            <div>
              <span className="app-lockup">
                <img src="/assets/putni-nalozi-icon.png" alt="" />
                <span><b>qla.dev Business modul</b><small>Mobilna aplikacija za službena putovanja</small></span>
              </span>
              <h2>
                <span>Putni nalozi. </span>
                <em>Od puta do izvještaja, bez papirologije između.</em>
              </h2>
            </div>
            <p>
              Kreirajte nalog, vodite rutu i troškove, skenirajte račune uz AI i pratite rad cijelog
              tima. Aplikacija je napravljena za telefon, jer se službeni put ne vodi iz kancelarije.
            </p>
          </div>

          <div className="feature-stage">
            <div className="feature-list">
              {[
                [ScanLine, 'AI obrada računa', 'Kamera ili fotografija pretvaraju račun u strukturirane podatke spremne za provjeru.'],
                [Plane, 'Cijeli putni nalog', 'Rute, dnevnice, troškovi, statusi i dokumenti ostaju povezani od početka do kraja.'],
                [UsersRound, 'Firma i tim', 'Vlasnik vidi članove, njihove naloge i zajedničku AI potrošnju kada je aktivira.'],
                [FileCheck2, 'Izvoz spreman za posao', 'Podatke izvezite u formate koji se lakše nastavljaju kroz administraciju i računovodstvo.'],
              ].map(([Icon, title, description], index) => {
                const FeatureIcon = Icon as typeof ScanLine;
                return (
                  <article className="feature-row reveal" style={{ transitionDelay: `${index * 70}ms` }} key={title as string}>
                    <span><FeatureIcon size={20} /></span>
                    <div><h3>{title as string}</h3><p>{description as string}</p></div>
                  </article>
                );
              })}
            </div>
            <div className="workflow-card reveal">
              <div className="export-panel">
                <div className="export-heading">
                  <span>Izvoz i integracije</span>
                  <small>Jedan završen nalog, više spremnih formata.</small>
                </div>
                <div className="export-options">
                  {exportOptions.map(({ Icon, imageSrc, name, format }) => {
                    return (
                      <div className={`export-option export-option-${name.toLowerCase()}`} key={name}>
                        <span>
                          {imageSrc
                            ? <img src={imageSrc} alt="" />
                            : Icon && <Icon size={15} strokeWidth={1.9} />}
                        </span>
                        <div><b>{name}</b><small>{format}</small></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="product-showcase-section">
          <div className="product-showcase-heading reveal">
            <span className="kicker">Aplikacija u svakodnevnom radu</span>
            <h2>Više od digitalnog obrasca. <em>Cijeli tok službenog puta.</em></h2>
            <p>
              Prikazi su izvedeni iz stvarnih ekrana aplikacije, od prvog naloga i računa do
              konačnog obračuna i pregleda potrošnje.
            </p>
          </div>

          <div className="product-showcase-layout">
            <div className="showcase-feature-nav reveal">
              {appShowcaseViews.map(({ label, title, description, Icon }, index) => (
                <button
                  className={index === activeShowcase ? 'showcase-feature is-active' : 'showcase-feature'}
                  type="button"
                  onClick={() => setActiveShowcase(index)}
                  key={label}
                >
                  <span><Icon size={18} /></span>
                  <div>
                    <small>{label}</small>
                    <b>{title}</b>
                    <p>{description}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="device-gallery reveal" aria-label="Prikazi aplikacije Putni nalozi">
              <div className="device-gallery-glow" />
              {appShowcaseViews.map(({ key, label }, index) => {
                let delta = index - activeShowcase;
                if (delta > appShowcaseViews.length / 2) delta -= appShowcaseViews.length;
                if (delta < -appShowcaseViews.length / 2) delta += appShowcaseViews.length;
                const distance = Math.abs(delta);
                return (
                  <button
                    className={index === activeShowcase ? 'showcase-device is-active' : 'showcase-device'}
                    type="button"
                    onClick={() => setActiveShowcase(index)}
                    aria-label={`Prikaži ekran: ${label}`}
                    style={{
                      '--showcase-x': `${delta * 145}px`,
                      '--showcase-y': `${distance * 34}px`,
                      '--showcase-angle': `${delta * 7.5}deg`,
                      '--showcase-scale': `${1 - Math.min(distance, 2) * 0.09}`,
                      zIndex: 10 - distance,
                      opacity: distance > 1 ? 0.42 : 1,
                    } as React.CSSProperties}
                    key={key}
                  >
                    <div className="showcase-device-shell">
                      <span className="showcase-device-island" />
                      <div className="showcase-device-status"><b>9:41</b><span>● ●</span></div>
                      <ShowcaseScreen type={key} />
                    </div>
                  </button>
                );
              })}
              <div className="device-gallery-controls">
                {appShowcaseViews.map(({ label }, index) => (
                  <button
                    className={index === activeShowcase ? 'active' : ''}
                    type="button"
                    aria-label={`Prikaži: ${label}`}
                    onClick={() => setActiveShowcase(index)}
                    key={label}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section principles" id="principi">
          <div className="section-heading compact reveal">
            <span className="kicker">Kako gradimo Business</span>
            <h2>Jednostavno za člana tima. <em>Ozbiljno za firmu.</em></h2>
          </div>
          <div className="principle-grid">
            {[
              [Boxes, 'Modularno od početka', 'Aktivirate samo alate koji vašoj firmi stvarno trebaju.'],
              [SmartphoneMark, 'Mobilno tamo gdje radite', 'Brze aplikacije za iOS i Android, oblikovane za stvarne poslovne situacije.'],
              [LockKeyhole, 'Prava pristupa po ulozi', 'Vlasnik, član i buduće uloge dobijaju samo ono što im pripada.'],
              [BarChart3, 'Jedna poslovna slika', 'Moduli postepeno grade povezane podatke i jasnije odlučivanje.'],
            ].map(([Icon, title, text], index) => {
              const PrincipleIcon = Icon as typeof Boxes;
              return (
                <article className="principle-card reveal" style={{ transitionDelay: `${index * 60}ms` }} key={title as string}>
                  <span><PrincipleIcon size={21} /></span>
                  <h3>{title as string}</h3>
                  <p>{text as string}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="section final-cta reveal" id="kontakt">
          <ParticleField />
          <div>
            <span className="kicker">qla.dev Business beta</span>
            <h2>Počnite s Putnim nalozima.</h2>
            <p>Uključite svoj tim u razvoj poslovnih alata koji nastaju ovdje, za način na koji firme ovdje rade.</p>
          </div>
          <a className="button button-light" href="mailto:info@qla.dev?subject=qla.dev%20Business%20beta">
            Zatraži pristup <ArrowRight size={17} />
          </a>
        </section>
      </main>

      <footer>
        <a className="brand footer-brand" href="#pocetna" aria-label="qla.dev Business početna">
          <img className="brand-light" src="/assets/qla-business.png" alt="qla.dev Business" />
          <img className="brand-dark" src="/assets/qla-business-dark.png" alt="" />
        </a>
        <p>Business apps koje rade zajedno.</p>
        <div>
          <a href="https://qla.dev">qla.dev</a>
          <a href="mailto:info@qla.dev">Kontakt</a>
          <a href="/privacy">Privatnost</a>
          <a href="/terms">Uslovi</a>
          <a href="/cookies">Kolačići</a>
          <a href="/help">Pomoć</a>
          <span>© {new Date().getFullYear()} qla.dev</span>
        </div>
      </footer>
    </div>
  );
}

function SmartphoneMark({ size = 21 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="6" y="2" width="12" height="20" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M10 5h4M11 19h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default App;
