/**
 *
 * @param element
 * @param className
 */
export const eClick = (element, className) => {
  element.addEventListener('click', (e) => {
    e.preventDefault();
    if(!element.classList.contains(className)) {
      element.classList.add(className);
    } else {
      element.classList.remove(className);
    }
  })
};

/**
 *
 * @param elements
 * @param className
 */
export const eMultiClick = (elements, className) => {
  for(let i = 0; i < elements.length; i++) {
    eClick(elements[i], className);
  }
};

/**
 *
 * @param element
 * @param menuElement
 * @param animation
 */
export const eMobileMenu = (settings) => {
  const OPEN = 'open';
  const FADE = settings.direction === 'left' ? 'navFadeInLeft' : 'navFadeInRight';
  const CLOSE = settings.direction === 'left' ? 'navFadeOutLeft' : 'navFadeOutRight';

  settings.element.addEventListener('click', () => {
    if(!settings.element.classList.contains(OPEN)) {
      settings.element.classList.add(OPEN);
      settings.menu.classList.remove(CLOSE);
      settings.menu.classList.add(OPEN);
      settings.menu.classList.add(FADE);
    } else {
      settings.element.classList.remove(OPEN);
      settings.menu.classList.remove(FADE);
      settings.menu.classList.remove(OPEN);
      settings.menu.classList.add(CLOSE);
    }
  })
};

export const eMenu = (element) => {
  const LINKS = element.querySelectorAll('.menu-item--expanded > a');

  const closeMenu = (item) => {
    item.classList.remove('hover');

    // Hide children
    const children = item.querySelectorAll('li.hover');

    for (let k = 0; k < children.length; k++) {
      children[k].classList.remove('hover');
    }

    // Add/remove whole menu class
    if(element.querySelectorAll('.menu-item--expanded.hover').length > 0) {
      element.classList.add('hover-open');
    } else {
      element.classList.remove('hover-open');
    }
  };

  const openMenu = (item, parentUL) => {
    // Hide other open menus
    for (let j = 0; j < parentUL.children.length; j++) {
      if(parentUL.children[j] != item) {
        closeMenu(parentUL.children[j]);
      }
    }

    // Trigger hover class
    if(item.classList.contains('hover')) {
      closeMenu(item);
    } else {
      item.classList.add('hover');
    }
  };

  // // Exit when blurring menu
  // element.addEventListener('pointerleave', (e) => {
  //   console.log("BLUURRRR");
  //   if(element.classList.contains('hover-open')) {
  //     element.classList.remove('hover-open');
  //     for (let i = 0; i < LINKS.length; i++ ) {
  //       LINKS[i].parentElement.classList.remove('hover');
  //     }
  //   }
  // });

  for (let i = 0; i < LINKS.length; i++) {
    const link = LINKS[i];
    const item = link.parentElement;
    const parentUL = item.parentElement;

    link.addEventListener('click', (e) => {
      e.preventDefault();

      openMenu(item, parentUL);
    });
  }

  const TOP_ITEMS = [...element.children].filter((item) => {return item.classList.contains('menu-item--expanded');});
  for (let i = 0; i < TOP_ITEMS.length; i++) {
    const item = TOP_ITEMS[i];
    const parentUL = item.parentElement;

    item.addEventListener('pointerenter', (e) => {
      if(e.pointerType != 'mouse' || screenCategory() != 'desktop') return;
      e.preventDefault();

      openMenu(item, parentUL);
    });

    item.addEventListener('pointerleave', (e) => {
      if(e.pointerType != 'mouse' || screenCategory() != 'desktop') return;

      closeMenu(item);
    });
  }
};

/**
 *
 * @param element
 * @param type
 * @param posFromTop
 */
export const animate = (element, type, posFromTop) => {
  let windowHeight = window.innerHeight;
  let elementPosFromTop = element.getBoundingClientRect().top;


  if((elementPosFromTop + posFromTop) <= windowHeight && !element.classList.contains(type)) {
    element.classList.add(type);
  }
};

/**
 *
 * @param func
 * @param wait
 * @param immediate
 * @returns {function()}
 */
export const debounce = (func, wait, immediate) => {
  let timeout;
  return () => {
    let context = this, args = arguments;
    let later = () => {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    let callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

export const toTop = (element, speed) => {
  element.addEventListener('click', () => {
    //set initial speed of the scroll
    let scrollStep = -window.scrollY / (300 / speed),
      // send it into an interval function
      scrollInterval = setInterval(() => {
        if ( window.scrollY !== 0 ) {
          window.scrollBy( 0, scrollStep );
        }
        else clearInterval(scrollInterval);
      },speed);
  });
};

/**
 *
 * @returns {*}
 */
export const screenCategory = () => {
  let width = window.innerWidth;
  let size;

  const screenSizes = {
    mobile: {title: 'mobile', width: 320},
    tablet: {title: 'tablet', width: 680},
    desktop: {title: 'desktop', width: 1000},
  };

  if(width < screenSizes.tablet.width) {
    size = screenSizes.mobile.title;
  } else if(width >= screenSizes.tablet.width && width < screenSizes.desktop.width) {
    size = screenSizes.tablet.title;
  } else {
    size = screenSizes.desktop.title;
  }
  return size;
};
