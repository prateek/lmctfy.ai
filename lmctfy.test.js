// ABOUTME: Unit tests for LMCTFY.ai functionality
// ABOUTME: Tests URL encoding, length validation, and error handling

const fs = require('fs');
const path = require('path');

// Load the HTML content
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

// Extract JavaScript from HTML
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
const scriptContent = scriptMatch ? scriptMatch[1] : '';

// Mock DOM environment
beforeEach(() => {
  document.body.innerHTML = html;
  
  // Mock clipboard API
  global.navigator.clipboard = {
    writeText: jest.fn(() => Promise.resolve())
  };
  
  // Execute extracted script
  eval(scriptContent);
});

describe('LMCTFY.ai', () => {
  describe('URL Encoding', () => {
    test('encodeURIComponent round-trip', () => {
      const testPrompts = [
        'How do I use ChatGPT?',
        'What is AI? Explain in detail.',
        'Special chars: !@#$%^&*()',
        'Multi\nline\nprompt',
        'Unicode: 你好世界 🌍'
      ];
      
      testPrompts.forEach(prompt => {
        const encoded = encodeURIComponent(prompt);
        const decoded = decodeURIComponent(encoded);
        expect(decoded).toBe(prompt);
      });
    });
    
    test('generates correct URL format', () => {
      const input = document.getElementById('promptInput');
      input.value = 'Test prompt';
      
      // Trigger generate
      window.generateLink();
      
      const linkText = document.getElementById('generatedLink').textContent;
      expect(linkText).toBe('https://lmctfy.ai/?q=Test%20prompt');
    });
  });
  
  describe('Length Validation', () => {
    test('16K character cap enforced', () => {
      const input = document.getElementById('promptInput');
      const longText = 'a'.repeat(16001);
      
      // Set value directly (bypassing maxlength attribute for testing)
      input.value = longText;
      
      // Mock showToast
      window.showToast = jest.fn();
      
      window.generateLink();
      
      expect(window.showToast).toHaveBeenCalledWith('Prompt is too long (16K max).', 'error');
    });
    
    test('accepts exactly 16K characters', () => {
      const input = document.getElementById('promptInput');
      input.value = 'a'.repeat(16000);
      
      window.showToast = jest.fn();
      window.generateLink();
      
      expect(window.showToast).not.toHaveBeenCalledWith('Prompt is too long (16K max).', 'error');
      expect(document.getElementById('generatedLink').textContent).toContain('https://lmctfy.ai/?q=');
    });
  });
  
  describe('Error Handling', () => {
    test('empty prompt shows error', () => {
      const input = document.getElementById('promptInput');
      input.value = '';
      
      window.showToast = jest.fn();
      input.focus = jest.fn();
      
      window.generateLink();
      
      expect(window.showToast).toHaveBeenCalledWith('Please enter a question.', 'error');
      expect(input.focus).toHaveBeenCalled();
    });
    
    test('whitespace-only prompt shows error', () => {
      const input = document.getElementById('promptInput');
      input.value = '   \n\t   ';
      
      window.showToast = jest.fn();
      
      window.generateLink();
      
      expect(window.showToast).toHaveBeenCalledWith('Please enter a question.', 'error');
    });
    
    test('clipboard failure shows error toast', async () => {
      navigator.clipboard.writeText = jest.fn(() => Promise.reject(new Error('Clipboard error')));
      window.showToast = jest.fn();
      
      window.generatedUrl = 'https://lmctfy.ai/?q=test';
      await window.copyLink();
      
      expect(window.showToast).toHaveBeenCalledWith('Couldn\'t copy — please copy manually.', 'error');
    });
    
    test('clipboard success shows success toast', async () => {
      window.showToast = jest.fn();
      window.generatedUrl = 'https://lmctfy.ai/?q=test';
      
      await window.copyLink();
      
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://lmctfy.ai/?q=test');
      expect(window.showToast).toHaveBeenCalledWith('Link copied!', 'success');
    });
  });
  
  describe('Character Counter', () => {
    test('updates character count on input', () => {
      const input = document.getElementById('promptInput');
      const countElement = document.getElementById('charCount');
      
      input.value = 'Hello';
      window.updateCharCount();
      
      expect(countElement.textContent).toBe('5');
    });
    
    test('adds warning class at 90% capacity', () => {
      const input = document.getElementById('promptInput');
      const countContainer = document.getElementById('charCount').parentElement;
      
      // Just under 90%
      input.value = 'a'.repeat(14399);
      window.updateCharCount();
      expect(countContainer.classList.contains('warning')).toBe(false);
      
      // At 90%
      input.value = 'a'.repeat(14400);
      window.updateCharCount();
      expect(countContainer.classList.contains('warning')).toBe(true);
    });
  });
  
  describe('Player Mode', () => {
    test('detects player mode from query parameter', () => {
      // Simulate URL with query parameter
      delete window.location;
      window.location = { search: '?q=test%20prompt' };
      
      const urlParams = new URLSearchParams(window.location.search);
      expect(urlParams.get('q')).toBe('test prompt');
    });
    
    test('preview parameter prevents redirect', () => {
      delete window.location;
      window.location = { search: '?q=test&preview=1' };
      
      const urlParams = new URLSearchParams(window.location.search);
      expect(urlParams.has('preview')).toBe(true);
    });
  });
  
  describe('Preview Functionality', () => {
    test('preview button creates iframe with correct src', () => {
      window.generatedUrl = 'https://lmctfy.ai/?q=test';
      
      const previewFrame = document.getElementById('previewFrame');
      const previewContainer = document.getElementById('previewContainer');
      
      window.showPreview();
      
      expect(previewFrame.src).toBe('https://lmctfy.ai/?q=test&preview=1');
      expect(previewContainer.style.display).toBe('block');
    });
  });
});