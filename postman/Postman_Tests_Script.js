/**
 * Postman Test Scripts for Quran Discipline Academy API
 *
 * This file contains reusable test scripts that can be copied into Postman request tests.
 */

// ============================================================================
// COMMON TESTS
// ============================================================================

/**
 * Test for successful response (2xx status)
 */
function testSuccess() {
    pm.test('Status code is 2xx', () => {
        pm.expect(pm.response.code).to.be.oneOf([200, 201, 204]);
    });
}

/**
 * Test for success response structure
 */
function testSuccessResponse() {
    pm.test('Response has success: true', () => {
        const jsonData = pm.response.json();
        pm.expect(jsonData.success).to.be.true;
    });

    pm.test('Response has data property', () => {
        const jsonData = pm.response.json();
        pm.expect(jsonData).to.have.property('data');
    });
}

/**
 * Test for error response structure
 */
function testErrorResponse() {
    pm.test('Response has success: false', () => {
        const jsonData = pm.response.json();
        pm.expect(jsonData.success).to.be.false;
    });

    pm.test('Response has error property', () => {
        const jsonData = pm.response.json();
        pm.expect(jsonData).to.have.property('error');
        pm.expect(jsonData.error).to.have.property('message');
    });
}

// ============================================================================
// AUTH TESTS
// ============================================================================

/**
 * Test login response
 */
function testLoginResponse() {
    pm.test('Status code is 200', () => {
        pm.response.to.have.status(200);
    });

    pm.test('Response has success: true', () => {
        const jsonData = pm.response.json();
        pm.expect(jsonData.success).to.be.true;
    });

    pm.test('Response has accessToken and user', () => {
        const jsonData = pm.response.json();
        pm.expect(jsonData.data).to.have.property('accessToken');
        pm.expect(jsonData.data).to.have.property('user');
        pm.expect(jsonData.data.user).to.have.property('id');
        pm.expect(jsonData.data.user).to.have.property('email');
        pm.expect(jsonData.data.user).to.have.property('role');
    });

    pm.test('Password is not in response', () => {
        const jsonData = pm.response.json();
        pm.expect(jsonData.data.user).to.not.have.property('password');
    });
}

/**
 * Test logout response
 */
function testLogoutAndClearTokens() {
    pm.test('Status code is 200', () => {
        pm.response.to.have.status(200);
    });

    pm.test('Response has success: true', () => {
        const jsonData = pm.response.json();
        pm.expect(jsonData.success).to.be.true;
    });

    pm.test('Response has logout message', () => {
        const jsonData = pm.response.json();
        pm.expect(jsonData.data.message).to.include('logged out');
    });
}

/**
 * Test refresh token response
 */
function testRefreshToken() {
    pm.test('Status code is 200', () => {
        pm.response.to.have.status(200);
    });

    pm.test('Response has new accessToken', () => {
        const jsonData = pm.response.json();
        pm.expect(jsonData.data).to.have.property('accessToken');
    });
}

// ============================================================================
// USER TESTS
// ============================================================================

/**
 * Test paginated list response
 */
function testPaginatedResponse() {
    pm.test('Status code is 200', () => {
        pm.response.to.have.status(200);
    });

    pm.test('Response has data array', () => {
        const jsonData = pm.response.json();
        pm.expect(jsonData.data).to.be.an('array');
    });

    pm.test('Response has pagination meta', () => {
        const jsonData = pm.response.json();
        pm.expect(jsonData.meta).to.have.property('total');
        pm.expect(jsonData.meta).to.have.property('page');
        pm.expect(jsonData.meta).to.have.property('limit');
        pm.expect(jsonData.meta).to.have.property('totalPages');
    });
}

/**
 * Test single user response
 */
function testUserResponse() {
    pm.test('Status code is 200', () => {
        pm.response.to.have.status(200);
    });

    pm.test('Response has user data', () => {
        const jsonData = pm.response.json();
        pm.expect(jsonData.data).to.have.property('id');
        pm.expect(jsonData.data).to.have.property('email');
        pm.expect(jsonData.data).to.have.property('fullName');
        pm.expect(jsonData.data).to.have.property('role');
        pm.expect(jsonData.data).to.have.property('sex');
    });

    pm.test('Password is not in response', () => {
        const jsonData = pm.response.json();
        pm.expect(jsonData.data).to.not.have.property('password');
    });
}

/**
 * Test created user response (201)
 */
function testUserCreated() {
    pm.test('Status code is 201', () => {
        pm.response.to.have.status(201);
    });

    pm.test('Response has created user', () => {
        const jsonData = pm.response.json();
        pm.expect(jsonData.data).to.have.property('id');
        pm.expect(jsonData.data).to.have.property('email');
        pm.expect(jsonData.data).to.have.property('role');
    });

    pm.test('Password is not in response', () => {
        const jsonData = pm.response.json();
        pm.expect(jsonData.data).to.not.have.property('password');
    });
}

// ============================================================================
// ERROR TESTS
// ============================================================================

/**
 * Test validation error (422)
 */
function testValidationError() {
    pm.test('Status code is 422', () => {
        pm.response.to.have.status(422);
    });

    pm.test('Response has error details', () => {
        const jsonData = pm.response.json();
        pm.expect(jsonData.success).to.be.false;
        pm.expect(jsonData.error).to.have.property('message');
    });
}

/**
 * Test unauthorized error (401)
 */
function testUnauthorized() {
    pm.test('Status code is 401', () => {
        pm.response.to.have.status(401);
    });

    pm.test('Response has error message', () => {
        const jsonData = pm.response.json();
        pm.expect(jsonData.success).to.be.false;
    });
}

/**
 * Test forbidden error (403)
 */
function testForbidden() {
    pm.test('Status code is 403', () => {
        pm.response.to.have.status(403);
    });

    pm.test('Response has error message', () => {
        const jsonData = pm.response.json();
        pm.expect(jsonData.success).to.be.false;
    });
}

// ============================================================================
// PRE-REQUEST SCRIPTS
// ============================================================================

/**
 * Auto-refresh token if expired
 * Add this to Collection-level pre-request script
 */
function autoRefreshToken() {
    const token = pm.environment.get('accessToken');
    const tokenExpiry = pm.environment.get('tokenExpiry');
    const now = new Date().getTime();

    if (token && tokenExpiry && now > parseInt(tokenExpiry)) {
        const baseUrl = pm.environment.get('baseUrl');
        const refreshUrl = baseUrl + '/auth/refresh-token';

        pm.sendRequest({
            url: refreshUrl,
            method: 'POST',
            header: { 'Content-Type': 'application/json' }
        }, (err, res) => {
            if (res && res.code === 201) {
                const response = res.json();
                pm.environment.set('accessToken', response.data.accessToken);
                const expiry = new Date();
                expiry.setMinutes(expiry.getMinutes() + 15);
                pm.environment.set('tokenExpiry', expiry.getTime());
            }
        });
    }
}

// ============================================================================
// EXPORTS FOR COPY-PASTE
// ============================================================================

/*
   COPY THIS INTO LOGIN REQUEST TESTS:

   pm.test('Status code is 201', () => {
       pm.response.to.have.status(201);
   });

   pm.test('Response has success: true', () => {
       const jsonData = pm.response.json();
       pm.expect(jsonData.success).to.be.true;
   });

   const jsonData = pm.response.json();
   pm.environment.set('accessToken', jsonData.data.accessToken);
   pm.environment.set('userId', jsonData.data.user.id);
   pm.environment.set('userEmail', jsonData.data.user.email);
   pm.environment.set('userRole', jsonData.data.user.role);

   const expiry = new Date();
   expiry.setMinutes(expiry.getMinutes() + 15);
   pm.environment.set('tokenExpiry', expiry.getTime());
*/

/*
   COPY THIS INTO PROTECTED REQUEST TESTS:

   pm.test('Status code is 2xx', () => {
       pm.expect(pm.response.code).to.be.oneOf([200, 201, 204]);
   });

   pm.test('Has Authorization header', () => {
       pm.expect(pm.request.headers.toHaveHeader('Authorization'));
   });
*/
