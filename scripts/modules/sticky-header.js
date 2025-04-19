export function initializeStickyHeader() {
  const header = document.querySelector('.header-container') || document.querySelector('header');
  if (!header) return;

  const topBar = header.querySelector('.top-bar');
  const mainHeader = header.querySelector('.main-header');
  const nav = header.querySelector('.main-nav');

  let lastScrollTop = 0;
  let headerHeight = header.offsetHeight;
  let topBarHeight = topBar ? topBar.offsetHeight : 0;

  function updateHeaderHeight() {
    headerHeight = header.offsetHeight;
    topBarHeight = topBar ? topBar.offsetHeight : 0;
  }

  function handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > lastScrollTop && scrollTop > headerHeight) {
      // Scrolling down
      header.classList.add('sticky-header');
      if (topBar) topBar.style.display = 'none';
    } else if (scrollTop <= 0) {
      // At the top
      header.classList.remove('sticky-header');
      header.style.top = '0';
      if (topBar) topBar.style.display = '';
      document.body.style.paddingTop = '0';
    } else if (scrollTop + window.innerHeight < document.documentElement.scrollHeight) {
      // Scrolling up
      header.classList.add('sticky-header');
      header.style.top = '0';
      if (topBar) topBar.style.display = '';
    }

    lastScrollTop = scrollTop;
  }

  window.addEventListener('scroll', handleScroll);
  window.addEventListener('resize', updateHeaderHeight);
  updateHeaderHeight();
}
