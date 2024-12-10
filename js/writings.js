// writings.js

document.addEventListener('DOMContentLoaded', () => {
  const writingsContainer = document.getElementById('writings-container');
  const loadWritingsButton = document.querySelector('#writings button');

  window.loadWritings = function() {
    fetch('./writings.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        writingsContainer.innerHTML = ''; // Clear previous writings
        data.writings.forEach(writing => {
          const writingCard = document.createElement('div');
          writingCard.classList.add('bg-gray-800', 'p-4', 'rounded-lg', 'shadow-md');

          const title = document.createElement('h3');
          title.classList.add('text-2xl', 'font-bold', 'mb-2');
          title.textContent = writing.title;

          const content = document.createElement('p');
          content.classList.add('text-gray-300');
          content.textContent = writing.content;

          writingCard.appendChild(title);
          writingCard.appendChild(content);
          writingsContainer.appendChild(writingCard);
        });
      })
      .catch(error => {
        writingsContainer.innerHTML = `<p class="text-red-500">Failed to load writings: ${error.message}</p>`;
      });
  }
});
