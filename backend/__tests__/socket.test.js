const jwt = require('jsonwebtoken');

describe('Socket Authentication', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test_jwt_secret_minimum_32_characters';
  });

  it('should generate valid token for socket auth', () => {
    const userId = '507f1f77bcf86cd799439011';
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.id).toBe(userId);
  });
});
