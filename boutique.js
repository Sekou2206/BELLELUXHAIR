(() => {
  const C = window.BOUTIQUE;
  const taux = C.acompte ?? 0.3;
  const pct = Math.round(taux * 100) + ' %';
  const P = C.produits.map(p => ({ ...p, images: p.images && p.images.length ? p.images : [p.image], precommande: p.precommande ?? C.precommandeParDefaut ?? true }));
  const parId = Object.fromEntries(P.map(p => [p.id, p]));
  const fmt = n => new Intl.NumberFormat('fr-FR').format(n) + ' FCFA';
  const acompteDe = p => p.precommande ? Math.ceil(p.prix * taux / 100) * 100 : 0;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = s => document.querySelector(s);

  const ICONE_WA = '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16 3.2C9 3.2 3.3 8.8 3.3 15.8c0 2.4.7 4.7 1.9 6.7L3.2 28.8l6.5-2c1.9 1 4.1 1.6 6.3 1.6 7 0 12.7-5.6 12.7-12.6S23 3.2 16 3.2zm0 22.9c-2 0-3.9-.6-5.5-1.6l-.4-.2-3.9 1.2 1.2-3.8-.3-.4a10.2 10.2 0 0 1-1.6-5.5C5.5 10.1 10.2 5.5 16 5.5s10.5 4.6 10.5 10.3S21.8 26.1 16 26.1zm5.8-7.7c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.6-1.6-1-.9-1.6-1.9-1.8-2.2-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.3.3-.6.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.2 1.4 3.5c.2.2 2.4 3.6 5.7 5 .8.4 1.4.6 1.9.7.8.3 1.5.2 2.1.1.6-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z"/></svg>';

  let panier = {};
  try { panier = JSON.parse(localStorage.getItem(C.cle) || '{}') || {}; } catch (e) { panier = {}; }
  Object.keys(panier).forEach(id => { if (!parId[id] || !(panier[id] > 0)) delete panier[id]; });

  let filtre = 'Tout';
  let ficheId = null;
  let ficheQte = 1;
  let retourFocus = null;
  const etat = { fiche: false, panier: false, commande: false };

  function monter() {
    document.body.insertAdjacentHTML('beforeend', `
<div class="b-voile" id="b-voile" data-fermer-panier></div>
<aside class="panier" id="panier" aria-label="Panier" aria-hidden="true">
  <div class="panier-tete"><h2>Votre panier</h2><button class="b-fermer" type="button" data-fermer-panier>Fermer <span aria-hidden="true">✕</span></button></div>
  <div class="panier-corps" id="panier-corps"></div>
  <div class="panier-pied" id="panier-pied"></div>
</aside>
<div class="fiche" id="fiche" role="dialog" aria-modal="true" aria-labelledby="fiche-nom" hidden>
  <div class="fiche-fond" data-fermer-fiche></div>
  <div class="fiche-boite">
    <button class="fiche-fermer" type="button" data-fermer-fiche aria-label="Fermer la fiche">✕</button>
    <div class="fiche-contenu" id="fiche-contenu">
      <div class="fiche-galerie">
        <div class="fiche-defile" id="fiche-defile"></div>
        <button class="fiche-fleche precedente" type="button" data-photo-pas="-1" aria-label="Photo précédente">‹</button>
        <button class="fiche-fleche suivante" type="button" data-photo-pas="1" aria-label="Photo suivante">›</button>
        <div class="fiche-points" id="fiche-points"></div>
      </div>
      <div class="fiche-texte">
        <span class="b-statut" id="fiche-statut"></span>
        <p class="fiche-sur" id="fiche-sur"></p>
        <h2 id="fiche-nom"></h2>
        <p class="fiche-resume" id="fiche-resume"></p>
        <dl class="fiche-paiement" id="fiche-paiement"></dl>
        <p class="fiche-note" id="fiche-note"></p>
        <div class="fiche-desc" id="fiche-desc"></div>
        <ul class="fiche-details" id="fiche-details"></ul>
        <button class="fiche-wa" type="button" id="fiche-wa">${ICONE_WA}<span>Poser une question sur WhatsApp</span></button>
        <div class="fiche-actions">
          <div class="qte" aria-label="Quantité"><button type="button" data-fiche-qte="-1" aria-label="Retirer un">−</button><span id="fiche-qte">1</span><button type="button" data-fiche-qte="1" aria-label="Ajouter un">+</button></div>
          <button class="b-btn" type="button" id="fiche-ajout"></button>
        </div>
      </div>
    </div>
  </div>
</div>
<div class="commande" id="commande" role="dialog" aria-modal="true" aria-labelledby="commande-titre" hidden>
  <div class="fiche-fond" data-fermer-commande></div>
  <div class="commande-boite">
    <button class="fiche-fermer" type="button" data-fermer-commande aria-label="Fermer">✕</button>
    <div id="commande-form-zone">
      <h2 id="commande-titre">Finaliser ma commande</h2>
      <dl class="recap" id="commande-recap"></dl>
      <form id="commande-form" novalidate>
        <div class="champs-duo">
          <label class="champ">Nom complet<input name="nom" required autocomplete="name"></label>
          <label class="champ">Téléphone<input name="tel" required type="tel" autocomplete="tel" inputmode="tel"></label>
        </div>
        <label class="champ">Ville<input name="ville" required autocomplete="address-level2"></label>
        <label class="champ">Adresse de livraison<textarea name="adresse" required rows="2" autocomplete="street-address"></textarea></label>
        ${C.champCadeau ? '<label class="champ">Emballage cadeau<select name="cadeau"><option>Non</option><option>Oui, c’est pour offrir</option></select></label>' : ''}
        <label class="champ">Précisions <em>(facultatif)</em><textarea name="note" rows="2"></textarea></label>
        <p class="form-erreur" id="form-erreur" role="alert"></p>
        <button class="b-btn wa" type="submit">${ICONE_WA}<span>Envoyer sur WhatsApp</span></button>
        <p class="recap-note">WhatsApp s’ouvre avec votre commande déjà rédigée. Il ne vous reste qu’à appuyer sur envoyer.</p>
      </form>
    </div>
    <div class="commande-ok" id="commande-ok" hidden>
      <span class="commande-ok-signe">✦</span>
      <h2>Votre commande est prête</h2>
      <p>Envoyez le message dans WhatsApp. Notre équipe vous répond pour confirmer votre commande, le paiement et la livraison.</p>
      <button class="b-btn wa" type="button" id="commande-renvoyer">${ICONE_WA}<span>Rouvrir WhatsApp</span></button>
      <button class="b-btn contour" type="button" id="commande-terminer">C’est envoyé, vider mon panier</button>
    </div>
  </div>
</div>
<a class="bulle-wa" href="#" data-wa aria-label="Discuter sur WhatsApp">${ICONE_WA}<span class="bulle-wa-texte">Discuter sur WhatsApp</span></a>
<div class="barre-mobile">
  <button class="barre-panier" type="button" data-ouvrir-panier>Panier <span class="b-compteur">0</span></button>
  <a class="barre-wa" href="#" data-wa>${ICONE_WA}<span>Discuter sur WhatsApp</span></a>
</div>
<div class="b-toast" id="b-toast" role="status" aria-live="polite"></div>`);
  }

  function carte(p) {
    const a = acompteDe(p);
    const statut = p.precommande ? 'Précommande' : 'Disponible';
    return `<article class="carte">
  <a class="carte-photo" href="#${p.id}" data-fiche="${p.id}" aria-label="Voir la fiche ${esc(p.nom)}">
    <img loading="lazy" src="${esc(p.images[0])}" alt="${esc(p.nom)}" style="object-position:${p.cadrage || '50% 50%'}">
    <span class="carte-etiquettes"><span class="b-statut ${p.precommande ? 'pre' : 'dispo'}">${statut}</span>${p.badge ? `<span class="carte-badge">${esc(p.badge)}</span>` : ''}</span>
    <span class="carte-voir">Voir la fiche</span>
  </a>
  <div class="carte-info">
    ${p.surtitre ? `<p class="carte-sur">${esc(p.surtitre)}</p>` : ''}
    <h3 class="carte-nom"><a href="#${p.id}" data-fiche="${p.id}">${esc(p.nom)}</a></h3>
    <p class="carte-resume">${esc(p.resume)}</p>
    <p class="carte-prix">${fmt(p.prix)}</p>
    ${p.precommande
      ? `<p class="carte-paiement"><span>Acompte ${pct} <b>${fmt(a)}</b></span><span>Solde à la livraison <b>${fmt(p.prix - a)}</b></span></p>`
      : `<p class="carte-paiement"><span>Payé à la livraison</span></p>`}
    <button class="carte-ajout" type="button" data-ajout="${p.id}">${p.precommande ? 'Précommander' : 'Ajouter au panier'} <span aria-hidden="true">+</span></button>
  </div>
</article>`;
  }

  function rendreGrille() {
    const g = document.getElementById(C.grille);
    if (!g) return;
    const liste = P.filter(p => filtre === 'Tout' || (filtre === 'pre' && p.precommande) || (filtre === 'dispo' && !p.precommande) || p.categorie === filtre);
    g.innerHTML = liste.length ? liste.map(carte).join('') : '<p class="grille-vide">Aucune pièce dans cette sélection pour le moment.</p>';
  }

  function totaux() {
    let total = 0, acompte = 0, nb = 0;
    for (const [id, q] of Object.entries(panier)) {
      const p = parId[id];
      total += p.prix * q;
      acompte += acompteDe(p) * q;
      nb += q;
    }
    return { total, acompte, solde: total - acompte, nb };
  }

  function recapHTML(t) {
    return `<div class="fort"><dt>Total</dt><dd>${fmt(t.total)}</dd></div>` +
      (t.acompte
        ? `<div><dt>Acompte à la commande</dt><dd>${fmt(t.acompte)}</dd></div><div><dt>Solde à la livraison</dt><dd>${fmt(t.solde)}</dd></div>`
        : `<div><dt>À régler à la livraison</dt><dd>${fmt(t.total)}</dd></div>`) +
      `<div class="discret"><dt>Livraison</dt><dd>Frais confirmés sur WhatsApp</dd></div>`;
  }

  function majPanier() {
    const t = totaux();
    document.querySelectorAll('.b-compteur').forEach(el => { el.textContent = t.nb; el.classList.toggle('plein', t.nb > 0); });
    const corps = $('#panier-corps');
    const pied = $('#panier-pied');
    if (!t.nb) {
      corps.innerHTML = `<div class="panier-vide"><p>Votre panier est vide pour le moment.</p><a class="b-btn contour" href="#${C.ancreCatalogue}" data-fermer-panier>Voir la collection</a></div>`;
      pied.innerHTML = '';
      return;
    }
    corps.innerHTML = P.filter(p => panier[p.id]).map(p => `<div class="ligne-panier">
  <a href="#${p.id}" data-fiche="${p.id}"><img src="${esc(p.images[0])}" alt="" style="object-position:${p.cadrage || '50% 50%'}"></a>
  <div>
    <span class="ligne-statut">${p.precommande ? 'Précommande' : 'Disponible'}</span>
    <p class="ligne-nom">${esc(p.nom)}</p>${p.surtitre ? `<p class="ligne-sur">${esc(p.surtitre)}</p>` : ''}
    <p class="ligne-prix">${fmt(p.prix)}${p.precommande ? ` · acompte ${fmt(acompteDe(p))}` : ''}</p>
    <div class="ligne-actions">
      <div class="qte"><button type="button" data-qte="${p.id}" data-pas="-1" aria-label="Retirer un">−</button><span>${panier[p.id]}</span><button type="button" data-qte="${p.id}" data-pas="1" aria-label="Ajouter un">+</button></div>
      <button class="lien" type="button" data-retirer="${p.id}">Retirer</button>
    </div>
  </div>
</div>`).join('');
    pied.innerHTML = `<dl class="recap">${recapHTML(t)}</dl>
<p class="recap-note">${t.acompte ? `Précommande : paiement en deux fois. Acompte de ${pct} à la commande, solde à la livraison.` : 'Paiement à la livraison.'}</p>
<button class="b-btn" type="button" data-commander>Valider ma commande <span aria-hidden="true">→</span></button>`;
  }

  function sauver() {
    try { localStorage.setItem(C.cle, JSON.stringify(panier)); } catch (e) {}
    majPanier();
  }

  function ajouter(id, q = 1) {
    panier[id] = (panier[id] || 0) + q;
    sauver();
    basculerPanier(true);
  }

  function bloquer() {
    document.documentElement.classList.toggle('b-bloque', etat.fiche || etat.panier || etat.commande);
  }

  function basculerPanier(ouvert) {
    etat.panier = ouvert;
    $('#panier').classList.toggle('on', ouvert);
    $('#panier').setAttribute('aria-hidden', String(!ouvert));
    $('#b-voile').classList.toggle('on', ouvert);
    bloquer();
    if (ouvert) setTimeout(() => $('#panier .b-fermer').focus({ preventScroll: true }), 50);
  }

  function ouvrirModale(el, cle) {
    el.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('on')));
    etat[cle] = true;
    bloquer();
  }

  function fermerModale(el, cle) {
    el.classList.remove('on');
    etat[cle] = false;
    bloquer();
    setTimeout(() => { if (!etat[cle]) el.hidden = true; }, 320);
  }

  function ouvrirFiche(id) {
    const p = parId[id];
    if (!p) return;
    if (!etat.fiche) retourFocus = document.activeElement;
    ficheId = id;
    ficheQte = 1;
    const a = acompteDe(p);
    const fiche = $('#fiche');
    fiche.classList.toggle('une-photo', p.images.length < 2);
    $('#fiche-defile').innerHTML = p.images.map((src, i) => `<img src="${esc(src)}" alt="${esc(p.nom)}, photo ${i + 1}" style="object-position:${p.cadrage || '50% 50%'}"${i ? ' loading="lazy"' : ''}>`).join('');
    $('#fiche-defile').scrollLeft = 0;
    $('#fiche-points').innerHTML = p.images.length > 1 ? p.images.map((_, i) => `<button type="button" data-photo="${i}" aria-label="Photo ${i + 1}"${i ? '' : ' class="on"'}></button>`).join('') : '';
    const st = $('#fiche-statut');
    st.textContent = p.precommande ? 'Précommande' : 'Disponible';
    st.className = 'b-statut ' + (p.precommande ? 'pre' : 'dispo');
    $('#fiche-sur').textContent = p.surtitre || '';
    $('#fiche-sur').hidden = !p.surtitre;
    $('#fiche-nom').textContent = p.nom;
    $('#fiche-resume').textContent = p.resume || '';
    $('#fiche-paiement').innerHTML = `<div class="fort"><dt>Prix</dt><dd>${fmt(p.prix)}</dd></div>` + (p.precommande
      ? `<div><dt>Acompte à la commande (${pct})</dt><dd>${fmt(a)}</dd></div><div><dt>Solde à la livraison</dt><dd>${fmt(p.prix - a)}</dd></div>`
      : `<div><dt>Paiement</dt><dd>À la livraison</dd></div>`);
    $('#fiche-note').textContent = p.precommande
      ? 'Pièce en précommande, paiement en deux fois. Le délai vous est communiqué lors de la confirmation sur WhatsApp.'
      : 'Pièce disponible. Vous réglez la totalité à la livraison.';
    $('#fiche-desc').innerHTML = String(p.description || '').split(/\n\s*\n/).filter(Boolean).map(t => `<p>${esc(t)}</p>`).join('');
    $('#fiche-details').innerHTML = (p.details || []).map(([k, v]) => `<li><span>${esc(k)}</span><span>${esc(v)}</span></li>`).join('');
    $('#fiche-details').hidden = !(p.details || []).length;
    $('#fiche-qte').textContent = '1';
    $('#fiche-ajout').innerHTML = `${p.precommande ? 'Précommander' : 'Ajouter au panier'} <span aria-hidden="true">+</span>`;
    $('#fiche-contenu').scrollTop = 0;
    $('.fiche-texte').scrollTop = 0;
    if (!etat.fiche) ouvrirModale(fiche, 'fiche');
    if (location.hash !== '#' + id) history.replaceState(null, '', '#' + id);
    setTimeout(() => $('#fiche .fiche-fermer').focus({ preventScroll: true }), 60);
  }

  function fermerFiche() {
    if (!etat.fiche) return;
    fermerModale($('#fiche'), 'fiche');
    ficheId = null;
    if (parId[location.hash.slice(1)]) history.replaceState(null, '', location.pathname + location.search);
    if (retourFocus && retourFocus.focus) retourFocus.focus({ preventScroll: true });
  }

  function allerPhoto(i) {
    const d = $('#fiche-defile');
    const n = d.children.length;
    if (!n) return;
    i = (i + n) % n;
    d.scrollTo({ left: i * d.clientWidth, behavior: 'smooth' });
  }

  function photoCourante() {
    const d = $('#fiche-defile');
    return Math.round(d.scrollLeft / Math.max(1, d.clientWidth));
  }

  function ouvrirCommande() {
    if (!totaux().nb) return;
    basculerPanier(false);
    $('#commande-recap').innerHTML = recapHTML(totaux());
    $('#commande-form-zone').hidden = false;
    $('#commande-ok').hidden = true;
    $('#form-erreur').textContent = '';
    ouvrirModale($('#commande'), 'commande');
    setTimeout(() => $('#commande .fiche-fermer').focus({ preventScroll: true }), 60);
  }

  let dernierMessage = '';

  function messageCommande(d) {
    const t = totaux();
    const lignes = P.filter(p => panier[p.id]).map(p => `• ${p.surtitre ? p.surtitre + ' ' : ''}${p.nom} × ${panier[p.id]} : ${fmt(p.prix * panier[p.id])}${p.precommande ? ' (précommande)' : ' (disponible)'}`);
    const paiement = t.acompte
      ? `Acompte à la commande : ${fmt(t.acompte)}\nSolde à la livraison : ${fmt(t.solde)}`
      : `À régler à la livraison : ${fmt(t.total)}`;
    return `Bonjour ${C.nom}, je souhaite passer cette commande :\n\n${lignes.join('\n')}\n\nTotal : ${fmt(t.total)}\n${paiement}\nFrais de livraison : à confirmer\n\nNom : ${d.get('nom')}\nTéléphone : ${d.get('tel')}\nVille : ${d.get('ville')}\nAdresse : ${d.get('adresse')}${C.champCadeau ? `\nEmballage cadeau : ${d.get('cadeau')}` : ''}\nPrécisions : ${d.get('note') || 'Aucune'}`;
  }

  function whatsapp(texte) {
    const url = 'https://wa.me/' + C.whatsapp + '?text=' + encodeURIComponent(texte);
    const w = window.open(url, '_blank');
    if (w) { try { w.opener = null; } catch (e) {} } else { location.href = url; }
  }

  let minuteur;
  function toast(t) {
    const el = $('#b-toast');
    el.textContent = t;
    el.classList.add('on');
    clearTimeout(minuteur);
    minuteur = setTimeout(() => el.classList.remove('on'), 2200);
  }

  function evenements() {
    document.addEventListener('click', e => {
      const t = e.target.closest('[data-filtre],[data-fiche],[data-ajout],[data-ouvrir-panier],[data-fermer-panier],[data-wa],[data-qte],[data-retirer],[data-fermer-fiche],[data-fermer-commande],[data-commander],[data-photo],[data-photo-pas],[data-fiche-qte]');
      if (!t) return;
      if (t.dataset.filtre !== undefined) {
        filtre = t.dataset.filtre;
        document.querySelectorAll('[data-filtre]').forEach(b => { b.classList.toggle(C.classeActif, b === t); b.setAttribute('aria-pressed', String(b === t)); });
        rendreGrille();
        t.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
      } else if (t.dataset.fiche !== undefined) {
        e.preventDefault();
        if (etat.panier) basculerPanier(false);
        ouvrirFiche(t.dataset.fiche);
      } else if (t.dataset.ajout !== undefined) {
        ajouter(t.dataset.ajout);
      } else if (t.dataset.ouvrirPanier !== undefined) {
        basculerPanier(true);
      } else if (t.dataset.fermerPanier !== undefined) {
        basculerPanier(false);
      } else if (t.dataset.wa !== undefined) {
        e.preventDefault();
        whatsapp(C.messageContact);
      } else if (t.dataset.qte !== undefined) {
        const id = t.dataset.qte;
        panier[id] = (panier[id] || 0) + Number(t.dataset.pas);
        if (panier[id] <= 0) delete panier[id];
        sauver();
      } else if (t.dataset.retirer !== undefined) {
        delete panier[t.dataset.retirer];
        sauver();
      } else if (t.dataset.fermerFiche !== undefined) {
        fermerFiche();
      } else if (t.dataset.fermerCommande !== undefined) {
        fermerModale($('#commande'), 'commande');
      } else if (t.dataset.commander !== undefined) {
        ouvrirCommande();
      } else if (t.dataset.photo !== undefined) {
        allerPhoto(Number(t.dataset.photo));
      } else if (t.dataset.photoPas !== undefined) {
        allerPhoto(photoCourante() + Number(t.dataset.photoPas));
      } else if (t.dataset.ficheQte !== undefined) {
        ficheQte = Math.max(1, ficheQte + Number(t.dataset.ficheQte));
        $('#fiche-qte').textContent = ficheQte;
      }
    });

    $('#fiche-ajout').addEventListener('click', () => {
      const id = ficheId;
      fermerFiche();
      ajouter(id, ficheQte);
    });

    $('#fiche-wa').addEventListener('click', () => {
      const p = parId[ficheId];
      whatsapp(`Bonjour ${C.nom}, j’ai une question sur ${C.article} « ${p.nom} » (${fmt(p.prix)}).`);
    });

    $('#fiche-defile').addEventListener('scroll', () => {
      const i = photoCourante();
      document.querySelectorAll('#fiche-points button').forEach((b, k) => b.classList.toggle('on', k === i));
    }, { passive: true });

    $('#commande-form').addEventListener('submit', e => {
      e.preventDefault();
      const f = e.target;
      const manquant = [...f.querySelectorAll('[required]')].find(el => !el.value.trim());
      if (manquant) {
        $('#form-erreur').textContent = 'Merci de remplir votre nom, votre téléphone, votre ville et votre adresse.';
        manquant.focus();
        return;
      }
      $('#form-erreur').textContent = '';
      dernierMessage = messageCommande(new FormData(f));
      whatsapp(dernierMessage);
      $('#commande-form-zone').hidden = true;
      $('#commande-ok').hidden = false;
      $('.commande-boite').scrollTop = 0;
    });

    $('#commande-renvoyer').addEventListener('click', () => whatsapp(dernierMessage));
    $('#commande-terminer').addEventListener('click', () => {
      panier = {};
      sauver();
      $('#commande-form').reset();
      fermerModale($('#commande'), 'commande');
      toast('Merci pour votre commande');
    });

    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      if (etat.commande) fermerModale($('#commande'), 'commande');
      else if (etat.fiche) fermerFiche();
      else if (etat.panier) basculerPanier(false);
    });

    window.addEventListener('hashchange', () => {
      const id = location.hash.slice(1);
      if (parId[id]) ouvrirFiche(id);
      else if (etat.fiche) fermerFiche();
    });

    document.addEventListener('error', e => {
      if (e.target.tagName === 'IMG') e.target.classList.add('img-absente');
    }, true);
  }

  document.querySelectorAll('img').forEach(i => { if (i.complete && !i.naturalWidth) i.classList.add('img-absente'); });
  monter();
  rendreGrille();
  majPanier();
  evenements();
  const depart = decodeURIComponent(location.hash.slice(1));
  if (parId[depart]) ouvrirFiche(depart);
})();
