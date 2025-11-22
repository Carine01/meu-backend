import { SanitizationPipe } from './sanitization.pipe';

describe('SanitizationPipe', () => {
  let pipe: SanitizationPipe;

  beforeEach(() => {
    pipe = new SanitizationPipe();
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it('should remove HTML tags from strings', () => {
    const input = 'Hello <script>alert("XSS")</script> World';
    const result = pipe.transform(input, {} as any);
    expect(result).toBe('Hello alert("XSS") World');
  });

  it('should remove javascript: protocol', () => {
    const input = 'javascript:alert("XSS")';
    const result = pipe.transform(input, {} as any);
    expect(result).toBe('alert("XSS")');
  });

  it('should remove event handlers', () => {
    const input = 'onclick=malicious()';
    const result = pipe.transform(input, {} as any);
    expect(result).toBe('malicious()');
  });

  it('should trim and normalize whitespace', () => {
    const input = '  Hello    World  ';
    const result = pipe.transform(input, {} as any);
    expect(result).toBe('Hello World');
  });

  it('should sanitize objects recursively', () => {
    const input = {
      name: '<script>alert("XSS")</script>John',
      email: '  test@example.com  ',
    };
    const result = pipe.transform(input, {} as any);
    expect(result.name).toBe('alert("XSS")John');
    expect(result.email).toBe('test@example.com');
  });

  it('should sanitize arrays', () => {
    const input = ['<b>test</b>', '  data  ', 'javascript:void(0)'];
    const result = pipe.transform(input, {} as any);
    expect(result).toEqual(['test', 'data', 'void(0)']);
  });

  it('should handle non-string, non-object values', () => {
    expect(pipe.transform(123, {} as any)).toBe(123);
    expect(pipe.transform(true, {} as any)).toBe(true);
    expect(pipe.transform(null, {} as any)).toBe(null);
  });
});
