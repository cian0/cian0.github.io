// utils/eruda.js

const initEruda = () => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      import('eruda').then(({ default: eruda }) => {
        if (
          new URLSearchParams(window.location.search).get('eruda') === 'true' ||
          localStorage.getItem('active-eruda') === 'true'
        ) {
          eruda.init();
        }
      });
    }
  };
  
  export const toggleEruda = () => {
    if (typeof window !== 'undefined') {
      if (window.eruda && window.eruda._isInit) {
        window.eruda.destroy();
        localStorage.removeItem('active-eruda');
      } else {
        import('eruda').then(({ default: eruda }) => {
          eruda.init();
          localStorage.setItem('active-eruda', 'true');
        });
      }
    }
  };
  
  export default initEruda;