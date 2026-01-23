document.querySelectorAll('.toggle').forEach(mainItem => {
        mainItem.addEventListener('click', () => {
          const submenu = mainItem.nextElementSibling;
          const arrow = mainItem.querySelector('.arrow');

          if (submenu.style.display === 'block') {
            submenu.style.display = 'none';
            arrow.textContent = 'v';
          } else {
            submenu.style.display = 'block';
            arrow.textContent = '^';
          }
        });
      });