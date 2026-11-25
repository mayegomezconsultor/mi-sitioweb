#!/usr/bin/env python3
import os
import re

ROOT = os.path.abspath(os.path.dirname(__file__) + "/..")

PAGES = [
    {
        "file": "index.html",
        "prefix": "",
        "url": "https://mayegomez.vercel.app/",
        "title": "Maye Gómez · Consultora de empresas",
        "desc": "Consultoría empresarial para pequeñas empresas de servicios. Maye Gómez conecta personas, clientes, dinero y operaciones en un sistema que tu equipo puede usar.",
        "is_home": True
    },
    {
        "file": "privacidad.html",
        "prefix": "",
        "url": "https://mayegomez.vercel.app/privacidad",
        "title": "Uso de tus datos · Maye Gómez Consultora",
        "desc": "Información transparente sobre la protección, tratamiento y privacidad de tus datos de contacto con Maye Gómez.",
        "is_home": False
    },
    {
        "file": "gracias.html",
        "prefix": "",
        "url": "https://mayegomez.vercel.app/gracias",
        "title": "Confirma tu correo · Maye Gómez Consultora",
        "desc": "Confirma tu solicitud para recibir la Checklist Diagnóstico y las cartas semanales de gestión de Maye Gómez.",
        "is_home": False
    },
    {
        "file": "servicios/sistema-4-pilares.html",
        "prefix": "../",
        "url": "https://mayegomez.vercel.app/servicios/sistema-4-pilares",
        "title": "Sistema de Gestión de 4 Pilares · Consultoría a Medida · Maye Gómez",
        "desc": "Conectamos personas, clientes, dinero y operaciones en un sistema a la medida de tu empresa. Acompañamiento directo en implementación con 2 llamadas semanales, WhatsApp y correo.",
        "is_home": False
    },
    {
        "file": "servicios/gestion-personal.html",
        "prefix": "../",
        "url": "https://mayegomez.vercel.app/servicios/gestion-personal",
        "title": "Consultoría de Gestión de Personal + Clear Onboarding · Maye Gómez",
        "desc": "Estructuramos roles, ciclo de vida del empleado y rutas de inducción para estabilizar a tu equipo. Acompañamiento a medida con 2 llamadas semanales, WhatsApp y correo.",
        "is_home": False
    },
    {
        "file": "servicios/formacion-rrhh.html",
        "prefix": "../",
        "url": "https://mayegomez.vercel.app/servicios/formacion-rrhh",
        "title": "Oficina de RRHH de cero a experta · Formación Práctica · Maye Gómez",
        "desc": "Una ruta de formación de 30 horas para conectar lo que aprendes con decisiones y herramientas de Recursos Humanos en tu empresa.",
        "is_home": False
    },
    {
        "file": "servicios/minicurso-rrhh.html",
        "prefix": "../",
        "url": "https://mayegomez.vercel.app/servicios/minicurso-rrhh",
        "title": "Minicurso de RRHH en 6 módulos · Maye Gómez Consultora",
        "desc": "Una entrada breve y guiada para reconocer qué necesita organizar tu empresa y acercarte a la gestión de Recursos Humanos con más claridad.",
        "is_home": False
    }
]

JSON_LD_SCHEMA = """  <!-- Structured Data: Organization & Person Schema for Top E-E-A-T & Google Rich Snippets -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": "https://mayegomez.vercel.app/#person",
        "name": "Maye Gómez",
        "jobTitle": "Consultora de Empresas y Especialista en Gestión de Equipos",
        "description": "Consultora empresarial especializada en diseño organizacional, gestión de personas, operaciones y sistemas para pequeñas empresas de servicios.",
        "url": "https://mayegomez.vercel.app",
        "image": "https://mayegomez.vercel.app/assets/og-image.png",
        "sameAs": [
          "https://wa.me/584124784922"
        ]
      },
      {
        "@type": "ProfessionalService",
        "@id": "https://mayegomez.vercel.app/#service",
        "name": "Maye Gómez · Consultoría de Empresas",
        "url": "https://mayegomez.vercel.app",
        "logo": "https://mayegomez.vercel.app/assets/logo-maye-gomez.png",
        "image": "https://mayegomez.vercel.app/assets/og-image.png",
        "description": "Consultoría y acompañamiento integral en gestión de personal, procesos operativos y dirección estratégica para pymes de servicios en Hispanoamérica y España.",
        "founder": { "@id": "https://mayegomez.vercel.app/#person" },
        "areaServed": [
          { "@type": "Country", "name": "Venezuela" },
          { "@type": "Country", "name": "España" },
          { "@type": "Country", "name": "Colombia" },
          { "@type": "Country", "name": "México" },
          { "@type": "Country", "name": "Estados Unidos" },
          { "@type": "Country", "name": "Chile" }
        ],
        "serviceType": [
          "Consultoría Empresarial",
          "Gestión de Personal y Recursos Humanos",
          "Diseño de Procesos y Operaciones",
          "Inducción y Onboarding de Equipos"
        ],
        "offers": [
          {
            "@type": "Offer",
            "name": "Sistema de Gestión de 4 Pilares",
            "url": "https://mayegomez.vercel.app/servicios/sistema-4-pilares.html"
          },
          {
            "@type": "Offer",
            "name": "Consultoría de Gestión de Personal + Clear Onboarding",
            "url": "https://mayegomez.vercel.app/servicios/gestion-personal.html"
          },
          {
            "@type": "Offer",
            "name": "Formación: Oficina de RRHH de cero a experta",
            "url": "https://mayegomez.vercel.app/servicios/formacion-rrhh.html"
          }
        ]
      }
    ]
  }
  </script>"""

def build_head_tags(page):
    p = page["prefix"]
    url = page["url"]
    title = page["title"]
    desc = page["desc"]
    
    tags = f"""  <!-- Favicon & Brand Icons -->
  <link rel="shortcut icon" href="{p}favicon.ico">
  <link rel="icon" type="image/x-icon" href="{p}favicon.ico">
  <link rel="icon" type="image/svg+xml" href="{p}assets/favicon.svg">
  <link rel="icon" type="image/png" sizes="32x32" href="{p}assets/favicon.png">
  <link rel="apple-touch-icon" sizes="180x180" href="{p}assets/apple-touch-icon.png">
  <link rel="manifest" href="{p}assets/site.webmanifest">

  <!-- OpenGraph / Social Sharing (E-E-A-T & Trend standard) -->
  <meta property="og:locale" content="es_ES">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Maye Gómez · Consultora de empresas">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{desc}">
  <meta property="og:url" content="{url}">
  <meta property="og:image" content="https://mayegomez.vercel.app/assets/og-image.png">
  <meta property="og:image:secure_url" content="https://mayegomez.vercel.app/assets/og-image.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Maye Gómez — Consultora de Empresas">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{title}">
  <meta name="twitter:description" content="{desc}">
  <meta name="twitter:image" content="https://mayegomez.vercel.app/assets/og-image.png">
  <meta name="twitter:image:alt" content="Maye Gómez — Consultora de Empresas">"""

    if page.get("is_home"):
        tags += "\n\n" + JSON_LD_SCHEMA

    return tags

def build_footer(page):
    p = page["prefix"]
    is_servicios = (p == "../")

    brand_href = f"{p}index.html#inicio" if is_servicios else "index.html#inicio"
    logo_src = f"{p}assets/logo-maye-gomez.png"
    
    # Links
    sol_pilares = "sistema-4-pilares.html" if is_servicios else "servicios/sistema-4-pilares.html"
    sol_personal = "gestion-personal.html" if is_servicios else "servicios/gestion-personal.html"
    sol_formacion = "formacion-rrhh.html" if is_servicios else "servicios/formacion-rrhh.html"
    sol_minicurso = "minicurso-rrhh.html" if is_servicios else "servicios/minicurso-rrhh.html"

    metodo_href = f"{p}index.html#metodo" if is_servicios else "index.html#metodo"
    testimonios_href = f"{p}index.html#testimonios" if is_servicios else "index.html#testimonios"
    descarga_href = f"{p}index.html#descarga" if is_servicios else "index.html#descarga"
    newsletter_href = f"{p}index.html#newsletter" if is_servicios else "index.html#newsletter"
    privacidad_href = f"{p}privacidad.html" if is_servicios else "privacidad.html"

    return f"""  <footer class="site-footer">
    <div class="section-wrap footer-seo-grid">
      <!-- Columna 1: Marca & E-E-A-T -->
      <div class="footer-col-brand">
        <a class="footer-brand" href="{brand_href}" aria-label="Maye Gómez, volver al inicio">
          <img src="{logo_src}" alt="Maye Gómez Consultora" width="54" height="39" loading="lazy">
          <span class="footer-brand-text">
            <strong>Maye Gómez</strong>
            <span>Consultora de empresas</span>
          </span>
        </a>
        <p class="footer-bio">Consultoría estratégica y sistemas humanos para pequeñas empresas de servicios. Transformamos el desorden operativo en claridad, estructura y autonomía de equipo.</p>
        <div class="footer-status-pill">
          <span class="status-dot-pulse" aria-hidden="true"></span>
          <span>Acompañamiento 1 a 1 · Cupos limitados 2026</span>
        </div>
      </div>

      <!-- Columna 2: Soluciones (Clúster SEO) -->
      <div>
        <h3 class="footer-heading">Soluciones</h3>
        <ul class="footer-nav-list">
          <li><a href="{sol_pilares}">Sistema de 4 Pilares <span class="footer-mini-tag">Integral</span></a></li>
          <li><a href="{sol_personal}">Gestión de Personal + Onboarding</a></li>
          <li><a href="{sol_formacion}">Oficina de RRHH de 0 a Experta</a></li>
          <li><a href="{sol_minicurso}">Minicurso Gratuito de RRHH</a></li>
        </ul>
      </div>

      <!-- Columna 3: Metodología & Recursos -->
      <div>
        <h3 class="footer-heading">Metodología</h3>
        <ul class="footer-nav-list">
          <li><a href="{metodo_href}">El Enfoque de 4 Pilares</a></li>
          <li><a href="{testimonios_href}">Casos y Testimonios</a></li>
          <li><a href="{descarga_href}">Checklist Diagnóstico (PDF)</a></li>
          <li><a href="{newsletter_href}">Cartas Semanales de Maye</a></li>
        </ul>
      </div>

      <!-- Columna 4: Contacto Directo & Confianza -->
      <div>
        <h3 class="footer-heading">Contacto Directo</h3>
        <ul class="footer-nav-list">
          <li>
            <a class="footer-wa-link" href="https://wa.me/584124784922?text=Hola%20Maye%2C%20quiero%20conversar%20sobre%20mi%20empresa." target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                <path d="M9.8 9.2a1 1 0 0 0-.8.4c-.4.5-.7 1.2-.5 2 .3 1.1 1.3 2.3 2.4 3 .8.5 1.5.3 2-.1.4-.3.5-.6.5-.8s-.3-.4-.5-.5l-.8-.3c-.2-.1-.4 0-.6.2l-.3.3c-.2.2-.3.2-.5.1-.5-.2-1.1-.7-1.5-1.1-.4-.4-.9-1-1.1-1.5-.1-.2-.1-.3.1-.5l.3-.3c.2-.2.3-.4.2-.6l-.3-.8c-.1-.2-.3-.5-.6-.6z"/>
              </svg>
              <span>Conversar con Maye</span>
              <span aria-hidden="true">↗</span>
            </a>
          </li>
          <li><span class="footer-micro-note">Respuesta personalizada en &lt; 24h</span></li>
          <li><a href="{privacidad_href}">Privacidad y Protección de Datos</a></li>
        </ul>
      </div>
    </div>

    <!-- Barra Inferior Legal / Territorial -->
    <div class="footer-bottom-bar">
      <div class="section-wrap footer-bottom-wrap">
        <span>© <span id="year">2026</span> Maye Gómez · Todos los derechos reservados</span>
        <span class="footer-bottom-geo">Consultoría de empresas · Modalidad remota (Hispanoamérica y España)</span>
      </div>
    </div>
  </footer>"""

def process_file(page):
    path = os.path.join(ROOT, page["file"])
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Update <head>
    # Remove any existing og:, twitter:, favicon links or json-ld in head to avoid duplicates
    head_end = content.find("</head>")
    if head_end == -1:
        print(f"Error: no </head> in {page['file']}")
        return False

    head_content = content[:head_end]
    rest_content = content[head_end:]

    # Clean existing og / twitter / icon / manifest / ld+json tags from head
    lines = head_content.splitlines()
    clean_lines = []
    skip_json_ld = False
    for line in lines:
        if '<script type="application/ld+json">' in line:
            skip_json_ld = True
            continue
        if skip_json_ld:
            if '</script>' in line:
                skip_json_ld = False
            continue
        if re.search(r'<meta\s+property=[\"\']og:', line):
            continue
        if re.search(r'<meta\s+name=[\"\']twitter:', line):
            continue
        if re.search(r'<link\s+rel=[\"\'](icon|apple-touch-icon|manifest)[\"\']', line):
            continue
        clean_lines.append(line)

    new_head_content = "\n".join(clean_lines)

    # Insert new tags right before </head>
    new_tags = build_head_tags(page)
    new_head_content = new_head_content.rstrip() + "\n\n" + new_tags + "\n"

    new_content = new_head_content + rest_content

    # 2. Update <footer>
    footer_pattern = re.compile(r'<footer class=[\"\']site-footer[\"\']>.*?</footer>', re.DOTALL)
    if not footer_pattern.search(new_content):
        print(f"Error: no <footer class='site-footer'> in {page['file']}")
        return False

    new_footer = build_footer(page)
    new_content = footer_pattern.sub(new_footer, new_content, count=1)

    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)

    print(f"✓ Successfully updated {page['file']}")
    return True

if __name__ == "__main__":
    for page in PAGES:
        process_file(page)
