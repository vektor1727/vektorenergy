/* Vektör Enerji — etkileşimler */
(function () {
  'use strict';

  // Yıl
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Mobil menü
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // SSS akordeon
  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      var open = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  // Scroll reveal
  var els = document.querySelectorAll('.card, .value, .why, .split-content, .split-media, .section-head, .stat-card, .review-card, .faq-item, .step, .portfolio-card');
  els.forEach(function (el) { el.classList.add('reveal'); });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add('in'); });
  }

  // ===== Portföy / Bitmiş İşler Filtreleme ve Lightbox Modali =====
  var filterButtons = document.querySelectorAll('.filter-btn');
  var portfolioCards = document.querySelectorAll('.portfolio-card');
  var lightbox = document.getElementById('portfolioLightbox');
  var lightboxContent = lightbox ? lightbox.querySelector('.lightbox-content') : null;
  var lightboxClose = lightbox ? lightbox.querySelector('.lightbox-close') : null;
  var lightboxPrev = lightbox ? lightbox.querySelector('.lightbox-prev') : null;
  var lightboxNext = lightbox ? lightbox.querySelector('.lightbox-next') : null;

  var visibleCards = [];
  var currentLightboxIndex = -1;

  // Slider Elemanları
  var sliderWrap = document.querySelector('.portfolio-slider-wrap');
  var sliderPrev = document.querySelector('.slider-arrow-prev');
  var sliderNext = document.querySelector('.slider-arrow-next');

  // Ok butonlarının aktif/pasif durumunu güncelleme
  function updateSliderArrows() {
    if (!sliderWrap || !sliderPrev || !sliderNext) return;
    var scrollLeft = sliderWrap.scrollLeft;
    var maxScroll = sliderWrap.scrollWidth - sliderWrap.clientWidth;

    if (scrollLeft <= 10) {
      sliderPrev.classList.add('disabled');
    } else {
      sliderPrev.classList.remove('disabled');
    }

    if (scrollLeft >= maxScroll - 10) {
      sliderNext.classList.add('disabled');
    } else {
      sliderNext.classList.remove('disabled');
    }
  }

  // Ok butonları tıklama olayları
  if (sliderWrap && sliderPrev && sliderNext) {
    var getScrollStep = function () {
      var firstCard = sliderWrap.querySelector('.portfolio-card:not(.hide)');
      if (firstCard) {
        return firstCard.offsetWidth + 24; // Kart genişliği + gap
      }
      return 344;
    };

    sliderNext.addEventListener('click', function () {
      sliderWrap.scrollBy({ left: getScrollStep() * 2, behavior: 'smooth' });
    });

    sliderPrev.addEventListener('click', function () {
      sliderWrap.scrollBy({ left: -getScrollStep() * 2, behavior: 'smooth' });
    });

    sliderWrap.addEventListener('scroll', updateSliderArrows);
    window.addEventListener('resize', updateSliderArrows);
    setTimeout(updateSliderArrows, 150);
  }

  // Sürükle ve kaydır özelliği (Desktop için mouse drag)
  var isDown = false;
  var startX;
  var scrollLeftVal;
  var dragMoved = false;

  if (sliderWrap) {
    sliderWrap.addEventListener('mousedown', function (e) {
      isDown = true;
      dragMoved = false;
      sliderWrap.style.scrollBehavior = 'auto'; // Sürüklerken gecikmeyi önle
      startX = e.pageX - sliderWrap.offsetLeft;
      scrollLeftVal = sliderWrap.scrollLeft;
    });

    sliderWrap.addEventListener('mouseleave', function () {
      isDown = false;
      sliderWrap.style.scrollBehavior = 'smooth';
    });

    sliderWrap.addEventListener('mouseup', function () {
      isDown = false;
      sliderWrap.style.scrollBehavior = 'smooth';
    });

    sliderWrap.addEventListener('mousemove', function (e) {
      if (!isDown) return;
      e.preventDefault();
      var x = e.pageX - sliderWrap.offsetLeft;
      var walk = (x - startX) * 1.5;
      if (Math.abs(x - startX) > 6) {
        dragMoved = true;
      }
      sliderWrap.scrollLeft = scrollLeftVal - walk;
    });
  }

  // Filtreleme mantığı
  if (filterButtons.length && portfolioCards.length) {
    filterButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterButtons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        var filterValue = btn.getAttribute('data-filter');

        portfolioCards.forEach(function (card) {
          var category = card.getAttribute('data-category');
          if (filterValue === 'all' || category === filterValue) {
            card.classList.remove('hide');
          } else {
            card.classList.add('hide');
          }
        });

        // Filtre değişince kaydırmayı başa sar ve okları güncelle
        if (sliderWrap) {
          sliderWrap.style.scrollBehavior = 'auto';
          sliderWrap.scrollLeft = 0;
          sliderWrap.style.scrollBehavior = 'smooth';
          setTimeout(updateSliderArrows, 100);
        }
      });
    });
  }

  // Lightbox Güncelleme Fonksiyonu
  function updateLightbox(index) {
    if (!lightboxContent || index < 0 || index >= visibleCards.length) return;
    currentLightboxIndex = index;
    var card = visibleCards[index];
    var type = card.getAttribute('data-type');
    var title = card.getAttribute('data-title') || '';
    var desc = card.getAttribute('data-desc') || '';

    lightboxContent.innerHTML = '';

    if (type === 'image') {
      var src = card.getAttribute('data-src');
      var img = document.createElement('img');
      img.src = src;
      img.alt = title;
      img.loading = 'eager';
      lightboxContent.appendChild(img);
    } else if (type === 'video') {
      var videoSrc = card.getAttribute('data-video');
      var video = document.createElement('video');
      video.src = videoSrc;
      video.controls = true;
      video.autoplay = true;
      video.loop = true;
      video.playsInline = true;
      lightboxContent.appendChild(video);
    }

    if (title || desc) {
      var caption = document.createElement('div');
      caption.className = 'lightbox-caption';
      caption.innerHTML = '<h4>' + title + '</h4>' + (desc ? '<p>' + desc + '</p>' : '');
      lightboxContent.appendChild(caption);
    }
  }

  // Lightbox Açma Mantığı
  if (portfolioCards.length && lightbox) {
    portfolioCards.forEach(function (card) {
      card.addEventListener('click', function (e) {
        // Eğer sürükleme (drag) yapıldıysa Lightbox'ı açma
        if (dragMoved) {
          dragMoved = false;
          return;
        }
        
        visibleCards = Array.from(portfolioCards).filter(function (c) {
          return !c.classList.contains('hide');
        });

        var idx = visibleCards.indexOf(card);
        if (idx !== -1) {
          lightbox.classList.add('open');
          lightbox.setAttribute('aria-hidden', 'false');
          document.body.style.overflow = 'hidden';
          updateLightbox(idx);
        }
      });
    });
  }

  // Lightbox Kapatma Mantığı
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lightboxContent) lightboxContent.innerHTML = '';
    currentLightboxIndex = -1;
  }

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
        closeLightbox();
      }
    });
  }

  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', function (e) {
      e.stopPropagation();
      if (currentLightboxIndex > 0) {
        updateLightbox(currentLightboxIndex - 1);
      } else {
        updateLightbox(visibleCards.length - 1);
      }
    });
  }

  if (lightboxNext) {
    lightboxNext.addEventListener('click', function (e) {
      e.stopPropagation();
      if (currentLightboxIndex < visibleCards.length - 1) {
        updateLightbox(currentLightboxIndex + 1);
      } else {
        updateLightbox(0);
      }
    });
  }

  document.addEventListener('keydown', function (e) {
    if (!lightbox || !lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft') {
      if (lightboxPrev) lightboxPrev.click();
    } else if (e.key === 'ArrowRight') {
      if (lightboxNext) lightboxNext.click();
    }
  });
})();

