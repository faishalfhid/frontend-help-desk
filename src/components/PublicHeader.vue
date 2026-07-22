<template>
  <header class="public-header">
    <div class="public-header__brand">
      <span aria-hidden="true">T</span>
      <strong>Helpdesk TIPD UIN Kediri</strong>
    </div>

    <nav aria-label="Navigasi layanan publik">
      <a
        class="public-header__link"
        href="#ticket-progress"
      >Cek Progres</a>
      <a
        class="public-header__primary"
        href="#new-ticket-form"
      >Ajukan Layanan</a>
    </nav>
  </header>
</template>

<style scoped>
.public-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 72px;
  padding: 0 var(--space-4);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
}
.public-header__brand, .public-header nav { display: flex; align-items: center; }
.public-header__brand { gap: 10px; }
.public-header__brand span {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: #fff;
  font-weight: 700;
  background: var(--color-primary-700);
}
.public-header__brand strong { font-size: 16px; }
.public-header nav { gap: var(--space-2); }
.public-header a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 var(--space-4);
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
}
.public-header__link { color: var(--color-primary-700); }
.public-header__link:hover { background: var(--color-primary-50); }
.public-header__primary { color: #fff; background: var(--color-primary-700); }
.public-header__primary:hover { background: var(--color-primary-600); }
@media (min-width: 768px) {
  .public-header { padding-inline: var(--space-8); }
  .public-header nav { gap: var(--space-6); }
}
@media (max-width: 520px) {
  .public-header__brand strong { max-width: 150px; font-size: 14px; }
  .public-header__link { display: none !important; }
}
</style>
