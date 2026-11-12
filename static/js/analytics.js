/**
 * Universal First-Party Analytics, Funnel & Multi-Channel Lead Capture Engine
 * Shared across Dakota AI (dakotaai.us), FonicTonic (fonictonic.com),
 * Neil Olson Portfolio (neilandrew.dev), SaveMyBonsai (savemybonsai.com),
 * and Ape Authority Associates (apeauthority.com).
 */
(function () {
  if (typeof window === 'undefined' || window.__DAKOTA_ANALYTICS_INITIALIZED__) return;
  window.__DAKOTA_ANALYTICS_INITIALIZED__ = true;

  var SUPABASE_URL = 'https://izgonqjpjcvdxxylqzyp.supabase.co';
  var SUPABASE_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6Z29ucWpwamN2ZHh4eWxxenlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczNjkzODAsImV4cCI6MjA2Mjk0NTM4MH0.h3xbq_tJEOvKUNYdWk48ts_xOga6S-msGBPLjXOOfeQ';
  var WEB3FORMS_ACCESS_KEY = '2d863a90-04b6-4ad1-ab7e-cb9cea55f08b';
  var NTFY_TOPIC = 'fonictonic_studio_leads_218';

  var DEFAULT_SITE = window.DAKOTA_ANALYTICS_SITE || 'savemybonsai.com';

  function detectSite() {
    if (window.DAKOTA_ANALYTICS_SITE) return window.DAKOTA_ANALYTICS_SITE;
    var host = (window.location.hostname || '').toLowerCase().replace(/^www\./, '');
    if (host.indexOf('dakotaai') !== -1) return 'dakotaai.us';
    if (host.indexOf('fonictonic') !== -1) return 'fonictonic.com';
    if (host.indexOf('neilandrew') !== -1) return 'neilandrew.dev';
    if (host.indexOf('savemybonsai') !== -1) return 'savemybonsai.com';
    if (host.indexOf('apeauthority') !== -1) return 'apeauthority.com';
    return DEFAULT_SITE;
  }

  var CURRENT_SITE = detectSite();

  function getSessionId() {
    try {
      var sid = sessionStorage.getItem('da_session_id');
      if (!sid) {
        sid =
          'sess_' +
          Date.now().toString(36) +
          '_' +
          Math.random().toString(36).substring(2, 9);
        sessionStorage.setItem('da_session_id', sid);
      }
      return sid;
    } catch (e) {
      return 'anon';
    }
  }

  function getDeviceType() {
    var w = window.innerWidth || 1024;
    if (w < 768) return 'mobile';
    if (w < 1024) return 'tablet';
    return 'desktop';
  }

  function getTrafficSource() {
    try {
      var params = new URLSearchParams(window.location.search);
      var utmSource = params.get('utm_source');
      var utmMedium = params.get('utm_medium');
      var utmCampaign = params.get('utm_campaign');
      var rawRef = document.referrer || '';
      var currentHost = (window.location.hostname || '').toLowerCase().replace(/^www\./, '');

      var referrerHost = 'direct';
      if (rawRef) {
        try {
          var url = new URL(rawRef);
          var refClean = url.hostname.toLowerCase().replace(/^www\./, '');
          if (
            refClean === currentHost ||
            refClean.indexOf(CURRENT_SITE.split('.')[0]) !== -1 ||
            refClean === 'localhost' ||
            refClean === '127.0.0.1'
          ) {
            var savedSource = sessionStorage.getItem('da_initial_source');
            var savedHost = sessionStorage.getItem('da_initial_ref_host');
            return {
              sourceCategory: savedSource || 'direct',
              referrerHost: savedHost || 'direct',
              utmSource: utmSource,
              utmMedium: utmMedium,
              utmCampaign: utmCampaign,
            };
          }
          referrerHost = refClean;
        } catch (e) {
          referrerHost = rawRef;
        }
      }

      var combined = ((utmSource || '') + ' ' + referrerHost).toLowerCase();
      var sourceCategory = 'direct';

      if (combined.indexOf('yelp') !== -1) {
        sourceCategory = 'Yelp';
      } else if (combined.indexOf('maps.google') !== -1 || combined.indexOf('gmb') !== -1) {
        sourceCategory = 'Google Maps / Business';
      } else if (combined.indexOf('google') !== -1) {
        sourceCategory = 'Google Search';
      } else if (combined.indexOf('bing') !== -1 || combined.indexOf('duckduckgo') !== -1) {
        sourceCategory = 'Bing / Search';
      } else if (combined.indexOf('linkedin') !== -1 || combined.indexOf('lnkd.in') !== -1) {
        sourceCategory = 'LinkedIn';
      } else if (combined.indexOf('github') !== -1) {
        sourceCategory = 'GitHub';
      } else if (combined.indexOf('facebook') !== -1 || combined.indexOf('fb.') !== -1) {
        sourceCategory = 'Facebook';
      } else if (combined.indexOf('instagram') !== -1) {
        sourceCategory = 'Instagram';
      } else if (combined.indexOf('youtube') !== -1 || combined.indexOf('youtu.be') !== -1) {
        sourceCategory = 'YouTube';
      } else if (combined.indexOf('reddit') !== -1) {
        sourceCategory = 'Reddit';
      } else if (combined.indexOf('twitter') !== -1 || combined.indexOf('t.co') !== -1 || combined.indexOf('x.com') !== -1) {
        sourceCategory = 'X / Twitter';
      } else if (referrerHost !== 'direct') {
        sourceCategory = 'Referral (' + referrerHost + ')';
      } else if (utmSource) {
        sourceCategory = 'Campaign (' + utmSource + ')';
      }

      sessionStorage.setItem('da_initial_source', sourceCategory);
      sessionStorage.setItem('da_initial_ref_host', referrerHost);

      return {
        sourceCategory: sourceCategory,
        referrerHost: referrerHost,
        utmSource: utmSource,
        utmMedium: utmMedium,
        utmCampaign: utmCampaign,
      };
    } catch (e) {
      return {
        sourceCategory: 'direct',
        referrerHost: 'direct',
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
      };
    }
  }

  function isAdminPage(pathname) {
    var p = (pathname || window.location.pathname || '').toLowerCase();
    return (
      p.indexOf('/admin') === 0 ||
      p.indexOf('admin.html') !== -1 ||
      p.indexOf('admin-analytics') !== -1 ||
      p.indexOf('/funnel') !== -1
    );
  }

  function getPageCategory(pathname) {
    var p = (pathname || '/').toLowerCase();
    if (p === '/' || p === '/index.html') return 'homepage_landing';
    if (p.indexOf('agros') !== -1) return 'agros_pilot';
    if (p.indexOf('demo') !== -1 || p.indexOf('explorations') !== -1 || p.indexOf('alpha') !== -1)
      return 'interactive_demo';
    if (p.indexOf('audit') !== -1 || p.indexOf('health') !== -1) return 'diagnostic_wizard';
    if (p.indexOf('blog') !== -1 || p.indexOf('posts') !== -1 || p.indexOf('species') !== -1 || p.indexOf('care-basics') !== -1 || p.indexOf('bonsai/') !== -1)
      return 'content_article';
    if (p.indexOf('contact') !== -1) return 'contact_page';
    if (p.indexOf('pricing') !== -1 || p.indexOf('services') !== -1) return 'services_pricing';
    if (p.indexOf('games') !== -1 || p.indexOf('t-minus-14') !== -1) return 'interactive_app';
    return 'general_page';
  }

  function insertSupabaseDirect(eventName, pagePath, enrichedProperties) {
    var payload = JSON.stringify({
      user_id: null,
      event_name: eventName,
      page: pagePath,
      properties: enrichedProperties,
    });

    return fetch(SUPABASE_URL + '/rest/v1/analytics_events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: 'Bearer ' + SUPABASE_ANON_KEY,
        Prefer: 'return=minimal',
      },
      body: payload,
      keepalive: true,
      cache: 'no-store',
    }).catch(function () {});
  }

  function trackEvent(payload) {
    try {
      if (!payload || !payload.eventName) return Promise.resolve();
      var pagePath = payload.page || window.location.pathname || '/';
      if (isAdminPage(pagePath)) return Promise.resolve();

      var traffic = getTrafficSource();
      var extraProps = payload.properties || {};
      var enrichedProperties = {
        site: extraProps.site || CURRENT_SITE,
        sessionId: getSessionId(),
        deviceType: getDeviceType(),
        trafficSource: traffic.sourceCategory,
        referrer: traffic.referrerHost,
        timestamp: new Date().toISOString(),
      };
      if (traffic.utmSource) enrichedProperties.utmSource = traffic.utmSource;
      if (traffic.utmMedium) enrichedProperties.utmMedium = traffic.utmMedium;
      if (traffic.utmCampaign) enrichedProperties.utmCampaign = traffic.utmCampaign;

      for (var k in extraProps) {
        if (Object.prototype.hasOwnProperty.call(extraProps, k)) {
          enrichedProperties[k] = extraProps[k];
        }
      }

      // Direct Supabase REST with keepalive:true works universally across static & edge hosts
      return insertSupabaseDirect(payload.eventName, pagePath, enrichedProperties);
    } catch (e) {
      return Promise.resolve();
    }
  }

  function submitLead(leadData) {
    try {
      var pagePath = leadData.page || window.location.pathname || '/';
      var name = (leadData.name || '').trim();
      var email = (leadData.email || '').trim();
      var phone = (leadData.phone || '').trim();
      var organization = (leadData.organization || '').trim();
      var formName = leadData.formName || 'Website Inquiry';
      var message = (leadData.message || '').trim();
      var submittedAt = new Date().toISOString();

      // Honeypot check
      if (leadData.company_website && String(leadData.company_website).trim().length > 0) {
        return Promise.resolve({ ok: true, honeypot: true });
      }

      var eventProps = {
        site: CURRENT_SITE,
        formName: formName,
        name: name || email || 'Visitor',
        email: email,
        phone: phone,
        organization: organization,
        message: message,
        submittedAt: submittedAt,
      };

      if (leadData.extra && typeof leadData.extra === 'object') {
        for (var key in leadData.extra) {
          if (Object.prototype.hasOwnProperty.call(leadData.extra, key)) {
            eventProps[key] = leadData.extra[key];
          }
        }
      }

      // 1. Record in Supabase analytics_events
      var p1 = trackEvent({
        eventName: 'form_submitted',
        page: pagePath,
        properties: eventProps,
      });

      // 2. Send instant push notification via ntfy.sh
      var ntfyLines = [
        'Site: ' + CURRENT_SITE + ' (' + formName + ')',
        name ? 'Name: ' + name : null,
        email ? 'Email: ' + email : null,
        phone ? 'Phone: ' + phone : null,
        organization ? 'Organization: ' + organization : null,
        message ? 'Details: ' + message : null,
        'Page: ' + pagePath,
      ]
        .filter(Boolean)
        .join('\n');

      var p2 = fetch('https://ntfy.sh/' + NTFY_TOPIC, {
        method: 'POST',
        headers: {
          Title: 'New Lead [' + CURRENT_SITE + ']: ' + (name || email || formName),
          Priority: 'high',
          Tags: 'bell,chart_with_upwards_trend',
        },
        body: ntfyLines,
        keepalive: true,
      }).catch(function () {});

      // 3. Send email notification via Web3Forms
      var p3 = fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: '[' + CURRENT_SITE + '] New ' + formName + ' from ' + (name || email || 'Visitor'),
          from_name: CURRENT_SITE + ' Lead Notification',
          name: name || 'Visitor',
          email: email || 'noreply@' + CURRENT_SITE,
          phone: phone || 'Not provided',
          organization: organization || 'Not provided',
          message: message || 'Submitted on ' + pagePath,
          page_url: window.location.href,
        }),
        keepalive: true,
      }).catch(function () {});

      return Promise.all([p1, p2, p3]).then(function () {
        return { ok: true };
      });
    } catch (e) {
      return Promise.resolve({ ok: false });
    }
  }

  // Expose public API on window
  window.DakotaAnalytics = {
    site: CURRENT_SITE,
    getSessionId: getSessionId,
    trackEvent: trackEvent,
    submitLead: submitLead,
  };

  // Do not run behavioral trackers on admin dashboard pages
  if (isAdminPage(window.location.pathname)) return;

  function initTracker() {
    var pathname = window.location.pathname || '/';
    var pageEnterTime = Date.now();
    var maxScrollPct = 0;
    var scrollMilestones = {};
    var viewedSections = [];
    var viewedSectionsMap = {};
    var engagementSent = false;
    var ctaClickedOnPage = false;

    // 1. Page View & Homepage View
    trackEvent({
      eventName: 'page_viewed',
      page: pathname,
      properties: {
        category: getPageCategory(pathname),
        pageTitle: document.title || pathname,
      },
    });

    if (pathname === '/' || pathname === '/index.html') {
      trackEvent({
        eventName: 'homepage_viewed',
        page: '/',
      });
    }

    // 2. Scroll Depth Milestones (25%, 50%, 75%, 90%)
    function handleScroll() {
      var scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      var docHeight =
        Math.max(
          document.body ? document.body.scrollHeight : 0,
          document.documentElement ? document.documentElement.scrollHeight : 0,
          document.body ? document.body.offsetHeight : 0,
          document.documentElement ? document.documentElement.offsetHeight : 0
        ) - window.innerHeight;

      if (docHeight <= 0) return;
      var pct = Math.min(100, Math.round((scrollTop / docHeight) * 100));
      if (pct > maxScrollPct) {
        maxScrollPct = pct;
      }

      var milestones = [25, 50, 75, 90];
      for (var i = 0; i < milestones.length; i++) {
        var m = milestones[i];
        if (pct >= m && !scrollMilestones[m]) {
          scrollMilestones[m] = true;
          trackEvent({
            eventName: 'scroll_depth',
            page: pathname,
            properties: {
              depthPercent: m,
              maxScrollPercent: maxScrollPct,
            },
          });
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    // 3. Section Visibility Tracking via IntersectionObserver
    if (typeof IntersectionObserver !== 'undefined') {
      var sectionObserver = new IntersectionObserver(
        function (entries) {
          for (var i = 0; i < entries.length; i++) {
            var entry = entries[i];
            if (entry.isIntersecting) {
              var el = entry.target;
              var secId =
                el.id ||
                el.getAttribute('data-section') ||
                el.getAttribute('aria-labelledby') ||
                '';
              if (secId && !viewedSectionsMap[secId]) {
                viewedSectionsMap[secId] = true;
                viewedSections.push(secId);
                var headingEl = el.querySelector('h1, h2, h3');
                var label =
                  el.getAttribute('data-section-label') ||
                  (headingEl ? headingEl.textContent.trim().slice(0, 60) : secId);
                trackEvent({
                  eventName: 'section_viewed',
                  page: pathname,
                  properties: {
                    sectionId: secId,
                    sectionLabel: label,
                    secondsSinceLoad: Math.round((Date.now() - pageEnterTime) / 1000),
                  },
                });
              }
            }
          }
        },
        { threshold: 0.25 }
      );

      var sections = document.querySelectorAll('section[id], section[aria-labelledby], [data-section]');
      for (var s = 0; s < sections.length; s++) {
        sectionObserver.observe(sections[s]);
      }
    }

    // 4. CTA, Contact Method & Feature Card Clicks
    document.addEventListener(
      'click',
      function (e) {
        var target = e.target;
        if (!target || !target.closest) return;

        var linkOrBtn = target.closest('a, button');
        if (!linkOrBtn) return;

        var href = linkOrBtn.getAttribute('href') || '';
        var text = (linkOrBtn.textContent || linkOrBtn.getAttribute('aria-label') || '')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 80);
        var parentSection = linkOrBtn.closest('section[id]');
        var sectionId = parentSection ? parentSection.id : 'page';

        // Direct contact links (mailto:, tel:, sms:)
        if (
          href.indexOf('mailto:') === 0 ||
          href.indexOf('tel:') === 0 ||
          href.indexOf('sms:') === 0
        ) {
          ctaClickedOnPage = true;
          var method =
            href.indexOf('mailto:') === 0
              ? 'email'
              : href.indexOf('sms:') === 0
              ? 'sms'
              : 'phone';
          trackEvent({
            eventName: 'contact_Method_clicked',
            page: pathname,
            properties: {
              method: method,
              label: text || href,
              href: href,
              sectionId: sectionId,
            },
          });
          return;
        }

        // Product / Demo / Feature Cards
        var card = linkOrBtn.closest(
          '.product-card, .project-card, .price-card, .demo-card, .real-samples'
        );
        if (card) {
          var cardTitleEl = card.querySelector('h3, h4, strong');
          var cardTitle = cardTitleEl
            ? cardTitleEl.textContent.replace(/\s+/g, ' ').trim().slice(0, 80)
            : text;
          trackEvent({
            eventName: 'feature_card_clicked',
            page: pathname,
            properties: {
              feature: cardTitle || 'card_item',
              label: text,
              href: href,
              sectionId: sectionId,
            },
          });
        }

        // Primary CTAs & Consultation Triggers
        var isCta =
          linkOrBtn.classList.contains('btn') ||
          linkOrBtn.classList.contains('btn-primary') ||
          linkOrBtn.classList.contains('btn-secondary') ||
          linkOrBtn.classList.contains('button') ||
          linkOrBtn.classList.contains('nav-cta') ||
          linkOrBtn.classList.contains('consultation-btn') ||
          href.indexOf('#pilot') !== -1 ||
          href.indexOf('#custom') !== -1 ||
          href.indexOf('#contact') !== -1 ||
          href.indexOf('contact.html') !== -1 ||
          href.indexOf('free-ai-audit.html') !== -1 ||
          href.indexOf('printify.me') !== -1;

        if (isCta) {
          if (
            href.indexOf('#pilot') !== -1 ||
            href.indexOf('#custom') !== -1 ||
            href.indexOf('#contact') !== -1 ||
            href.indexOf('contact.html') !== -1 ||
            linkOrBtn.classList.contains('consultation-btn')
          ) {
            ctaClickedOnPage = true;
          }
          trackEvent({
            eventName: 'cta_clicked',
            page: pathname,
            properties: {
              label: text || 'CTA Button',
              href: href,
              sectionId: sectionId,
            },
          });
        }
      },
      true
    );

    // 5. FAQ Details Toggles
    var detailsList = document.querySelectorAll('details');
    for (var d = 0; d < detailsList.length; d++) {
      (function (det) {
        det.addEventListener('toggle', function () {
          if (det.open) {
            var sum = det.querySelector('summary');
            trackEvent({
              eventName: 'faq_toggled',
              page: pathname,
              properties: {
                question: sum ? sum.textContent.trim().slice(0, 120) : 'FAQ item',
              },
            });
          }
        });
      })(detailsList[d]);
    }

    // 6. HTML5 Video Tracking (Play, 5s Heartbeat, Progress Milestones, Complete)
    var videos = document.querySelectorAll('video');
    for (var v = 0; v < videos.length; v++) {
      (function (video, idx) {
        var videoId =
          video.id ||
          video.getAttribute('data-video-id') ||
          video.currentSrc ||
          'video_' + (idx + 1);
        var videoTitle =
          video.getAttribute('data-video-title') ||
          video.getAttribute('title') ||
          document.title + ' Video #' + (idx + 1);
        var milestonesSent = {};
        var lastHeartbeatAt = 0;

        video.addEventListener('play', function () {
          trackEvent({
            eventName: 'video_play',
            page: pathname,
            properties: {
              videoId: videoId,
              videoTitle: videoTitle,
              currentTime: Math.round(video.currentTime || 0),
            },
          });
        });

        video.addEventListener('timeupdate', function () {
          var cur = video.currentTime || 0;
          var dur = video.duration || 0;
          var now = Date.now();
          if (now - lastHeartbeatAt >= 5000 && !video.paused) {
            lastHeartbeatAt = now;
            trackEvent({
              eventName: 'video_heartbeat',
              page: pathname,
              properties: {
                videoId: videoId,
                videoTitle: videoTitle,
                watchedSeconds: Math.round(cur),
                durationSeconds: Math.round(dur),
              },
            });
          }
          if (dur > 0) {
            var pct = Math.round((cur / dur) * 100);
            var vMilestones = [25, 50, 75];
            for (var m = 0; m < vMilestones.length; m++) {
              var vm = vMilestones[m];
              if (pct >= vm && !milestonesSent[vm]) {
                milestonesSent[vm] = true;
                trackEvent({
                  eventName: 'video_progress',
                  page: pathname,
                  properties: {
                    videoId: videoId,
                    videoTitle: videoTitle,
                    milestonePercent: vm,
                    watchedSeconds: Math.round(cur),
                  },
                });
              }
            }
          }
        });

        video.addEventListener('pause', function () {
          if (!video.ended) {
            trackEvent({
              eventName: 'video_pause',
              page: pathname,
              properties: {
                videoId: videoId,
                videoTitle: videoTitle,
                watchedSeconds: Math.round(video.currentTime || 0),
              },
            });
          }
        });

        video.addEventListener('ended', function () {
          trackEvent({
            eventName: 'video_complete',
            page: pathname,
            properties: {
              videoId: videoId,
              videoTitle: videoTitle,
              watchedSeconds: Math.round(video.duration || video.currentTime || 0),
            },
          });
        });
      })(videos[v], v);
    }

    // 7. Universal Form Funnel (Start, Field Completion, Abandonment, Submission)
    var forms = document.querySelectorAll('form');
    var trackedForms = [];

    for (var f = 0; f < forms.length; f++) {
      (function (form, idx) {
        if (form.getAttribute('data-analytics-ignore') === 'true') return;
        var formId = form.id || form.getAttribute('name') || 'form_' + (idx + 1);
        var formName =
          form.getAttribute('data-form-name') ||
          (form.querySelector('input[name="_subject"]')
            ? form.querySelector('input[name="_subject"]').value
            : null) ||
          formId;

        var state = {
          form: form,
          formId: formId,
          formName: formName,
          started: false,
          startTime: null,
          submitted: false,
          abandonmentSent: false,
          touchedFields: [],
          touchedMap: {},
          lastField: 'none',
        };
        trackedForms.push(state);

        function markStarted(fieldName) {
          state.lastField = fieldName;
          if (!state.touchedMap[fieldName]) {
            state.touchedMap[fieldName] = true;
            state.touchedFields.push(fieldName);
          }
          if (!state.started) {
            state.started = true;
            state.startTime = Date.now();
            trackEvent({
              eventName: 'form_started',
              page: pathname,
              properties: {
                formId: state.formId,
                formName: state.formName,
                firstField: fieldName,
              },
            });
          }
        }

        form.addEventListener(
          'input',
          function (e) {
            var el = e.target;
            if (!el) return;
            var name = el.name || el.id || el.type || 'field';
            if (name === 'company_website' || name === '_subject') return;
            markStarted(name);
          },
          true
        );

        form.addEventListener(
          'change',
          function (e) {
            var el = e.target;
            if (!el) return;
            var name = el.name || el.id || el.type || 'field';
            if (name === 'company_website' || name === '_subject') return;
            markStarted(name);
            if (el.value && String(el.value).trim().length > 0) {
              trackEvent({
                eventName: 'form_field_completed',
                page: pathname,
                properties: {
                  formId: state.formId,
                  formName: state.formName,
                  fieldName: name,
                  hasValue: true,
                },
              });
            }
          },
          true
        );

        form.addEventListener(
          'submit',
          function () {
            state.submitted = true;
            // If the form handles its own custom lead submission via window.DakotaAnalytics.submitLead, skip duplicate
            if (form.getAttribute('data-custom-lead-handler') === 'true') return;

            var fd = new FormData(form);
            var firstName = fd.get('first_name') || '';
            var lastName = fd.get('last_name') || '';
            var fullName =
              fd.get('name') ||
              fd.get('userName') ||
              (firstName || lastName ? (firstName + ' ' + lastName).trim() : '');
            var email = fd.get('email') || fd.get('userEmail') || '';
            var phone = fd.get('phone') || '';
            var org = fd.get('organization') || fd.get('company') || '';
            var msg =
              fd.get('message') ||
              fd.get('design') ||
              fd.get('bonsai_description') ||
              fd.get('project') ||
              '';

            // Check footer single email input without name="email"
            if (!email) {
              var emailInput = form.querySelector('input[type="email"]');
              if (emailInput && emailInput.value) email = emailInput.value;
            }

            submitLead({
              page: pathname,
              formName: state.formName,
              name: String(fullName || ''),
              email: String(email || ''),
              phone: String(phone || ''),
              organization: String(org || ''),
              message: String(msg || ''),
            });
          },
          true
        );
      })(forms[f], f);
    }

    // 8. Flush Page Engagement & Form Abandonment on Page Leave / Hide
    function flushExitEvents() {
      // Check form abandonment
      for (var i = 0; i < trackedForms.length; i++) {
        var st = trackedForms[i];
        if (!st.submitted && !st.abandonmentSent && (st.started || ctaClickedOnPage)) {
          st.abandonmentSent = true;
          var filled = [];
          var inputs = st.form.querySelectorAll('input, textarea, select');
          for (var j = 0; j < inputs.length; j++) {
            var inp = inputs[j];
            var fName = inp.name || inp.id || '';
            if (
              fName &&
              fName !== '_subject' &&
              fName !== 'company_website' &&
              inp.type !== 'hidden'
            ) {
              if (
                (inp.type === 'radio' || inp.type === 'checkbox') &&
                inp.checked &&
                filled.indexOf(fName) === -1
              ) {
                filled.push(fName);
              } else if (
                inp.type !== 'radio' &&
                inp.type !== 'checkbox' &&
                inp.value &&
                String(inp.value).trim().length > 0 &&
                filled.indexOf(fName) === -1
              ) {
                filled.push(fName);
              }
            }
          }
          var spent = st.startTime ? Math.round((Date.now() - st.startTime) / 1000) : 0;
          trackEvent({
            eventName: 'form_abandoned',
            page: pathname,
            beacon: true,
            properties: {
              formId: st.formId,
              formName: st.formName,
              stage: st.started ? 'started_typing_not_submitted' : 'clicked_cta_never_typed',
              filledFields: filled,
              filledCount: filled.length,
              touchedFields: st.touchedFields,
              lastField: st.lastField,
              timeSpentSeconds: spent,
            },
          });
        }
      }

      // Flush page engagement
      if (!engagementSent) {
        var engagedSeconds = Math.round((Date.now() - pageEnterTime) / 1000);
        if (engagedSeconds >= 2) {
          engagementSent = true;
          trackEvent({
            eventName: 'page_engagement',
            page: pathname,
            beacon: true,
            properties: {
              engagedSeconds: Math.min(engagedSeconds, 3600),
              maxScrollPercent: maxScrollPct,
              sectionsViewed: viewedSections,
            },
          });
        }
      }
    }

    window.addEventListener('pagehide', flushExitEvents);
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') {
        flushExitEvents();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTracker);
  } else {
    initTracker();
  }
})();
