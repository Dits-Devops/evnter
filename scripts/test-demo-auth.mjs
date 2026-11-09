import assert from 'node:assert/strict';

const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';
const fixtures = [
  ['admin', 'admin@evnter.id'],
  ['organizer', 'organizer@evnter.id'],
  ['user', 'dits@evnter.id'],
];

async function login(email, password) {
  const res = await fetch(`${base}/api/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return { status: res.status, cookie: res.headers.get('set-cookie'), body: await res.json() };
}

for (const [role, email] of fixtures) {
  const good = await login(email, 'password123');
  assert.equal(good.status, 200, `${role} login must succeed (got ${good.status})`);
  assert.equal(good.body.user?.role, role);
  assert.ok(good.cookie?.includes('token='), `${role} needs session cookie`);
  const me = await fetch(`${base}/api/users`, { headers: { Cookie: good.cookie.split(';')[0] } });
  assert.equal(me.status, 200);
  assert.equal((await me.json()).user?.role, role);
  const bad = await login(email, 'not-the-password');
  assert.equal(bad.status, 401, `${role} wrong password must fail`);
  assert.equal(bad.cookie, null, `${role} wrong password must not create a cookie`);
  console.log(`${role}: valid login and wrong-password rejection verified`);
}
for (const email of ['admin-random@example.invalid', 'organizer-something@example.invalid']) {
  const bad = await login(email, 'password123');
  assert.equal(bad.status, 401, 'unlisted email must fail');
  assert.equal(bad.cookie, null);
}
console.log('Unknown privileged email rejection verified');
