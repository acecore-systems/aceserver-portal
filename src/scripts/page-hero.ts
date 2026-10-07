// A fixed banner must also fit translated titles and navigation controls.
// Fit only the title; keep every word and every action visible.
export function initPageHeroes() {
  for (const hero of document.querySelectorAll<HTMLElement>(
    '[data-page-hero]',
  )) {
    if (hero.dataset.heroReady === 'true') continue
    const copy = hero.querySelector<HTMLElement>('[data-page-hero-copy]')
    const title = hero.querySelector<HTMLElement>('[data-page-hero-title]')
    if (!copy || !title) continue
    hero.dataset.heroReady = 'true'
    let frame = 0

    const fit = () => {
      if (frame) cancelAnimationFrame(frame)
      frame = 0
      title.style.removeProperty('font-size')
      const style = getComputedStyle(title)
      const siblings = Array.from(copy.children).filter(
        (element): element is HTMLElement =>
          element instanceof HTMLElement && element !== title,
      )
      const gap = Number.parseFloat(getComputedStyle(copy).rowGap) || 0
      const available =
        copy.clientHeight -
        siblings.reduce(
          (height, element) => height + element.getBoundingClientRect().height,
          0,
        ) -
        gap * siblings.length
      const maximum = Number.parseFloat(style.fontSize)
      if (title.getBoundingClientRect().height <= available) return

      const rootSize = Number.parseFloat(
        getComputedStyle(document.documentElement).fontSize,
      )
      let lower = rootSize
      let upper = maximum
      for (let step = 0; step < 10; step += 1) {
        const size = (lower + upper) / 2
        title.style.fontSize = `${size}px`
        if (title.getBoundingClientRect().height <= available) lower = size
        else upper = size
      }
      title.style.fontSize = `${lower}px`
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(fit)
    }
    const observer = new ResizeObserver(schedule)
    observer.observe(hero)
    for (const element of copy.children) {
      if (element !== title) observer.observe(element)
    }
    // The diary can switch its title without changing the outer dimensions.
    new MutationObserver(schedule).observe(title, {
      subtree: true,
      childList: true,
      characterData: true,
    })
    const themeHost = hero.closest('[data-record-kind]')
    if (themeHost) {
      new MutationObserver(schedule).observe(themeHost, {
        attributes: true,
        attributeFilter: ['data-record-kind'],
      })
    }
    fit()
    void document.fonts.ready.then(() => {
      fit()
      hero.dataset.heroFit = 'ready'
    })
  }
}
