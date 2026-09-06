describe('OrangeHRM E2E Automation', () => {

  const adminUsername = 'Admin';
  const adminPassword = 'admin123';

  const timestamp = Date.now();

  const employee = {
    firstName: 'John',
    middleName: 'Automation',
    lastName: `Test${timestamp}`,
    username: `john${timestamp}`,
    password: 'Password123!'
  };


  // =========================================================
  // LOGIN HELPER
  // =========================================================

  function login(username, password) {

    cy.visit('/web/index.php/auth/login');

    cy.get('input[name="username"]')
      .should('be.visible')
      .type(username);

    cy.get('input[name="password"]')
      .type(password);

    cy.get('button[type="submit"]')
      .click();

    cy.url()
      .should('include', '/dashboard');
  }


  function logout() {

    cy.get('.oxd-userdropdown-tab')
      .click();

    cy.contains('Logout')
      .click();

    cy.url()
      .should('include', '/auth/login');
  }


  // =========================================================
  // FLOW 1
  // MENAMBAHKAN KARYAWAN BARU
  // =========================================================

  describe('Flow 1 - Add New Employee', () => {

    // -------------------------------------------------------
    // POSITIVE CASE
    // -------------------------------------------------------

    // it('TC01 - Positive: Admin berhasil menambahkan employee baru', () => {

    //   login(
    //     adminUsername,
    //     adminPassword
    //   );

    //   // PIM
    //   cy.contains('PIM')
    //     .click();

    //   // Add Employee
    //   cy.contains('Add Employee')
    //     .click();

    //   // First Name
    //   cy.get('input[placeholder="First Name"]')
    //     .type(employee.firstName);

    //   // Middle Name
    //   cy.get('input[placeholder="Middle Name"]')
    //     .type(employee.middleName);

    //   // Last Name
    //   cy.get('input[placeholder="Last Name"]')
    //     .type(employee.lastName);

    //   // Save
    //   cy.contains('button', 'Save')
    //     .click();

    //   // Assertion
    //   cy.contains('Personal Details')
    //     .should('be.visible');

    //   cy.get('input[name="firstName"]')
    //     .should('have.value', employee.firstName);

    //   cy.get('input[name="lastName"]')
    //     .should('have.value', employee.lastName);

    //   // Screenshot
    //   cy.screenshot(
    //     'TC01-add-employee-success'
    //   );

    //   logout();
    // });


    // -------------------------------------------------------
    // NEGATIVE CASE
    // -------------------------------------------------------

    // it('TC02 - Negative: Admin tidak bisa menambahkan employee tanpa First Name', () => {

    //   login(
    //     adminUsername,
    //     adminPassword
    //   );

    //   cy.contains('PIM')
    //     .click();

    //   cy.contains('Add Employee')
    //     .click();

    //   // Hanya isi Last Name
    //   cy.get('input[placeholder="Last Name"]')
    //     .type('NegativeTest');

    //   cy.contains('button', 'Save')
    //     .click();

    //   // Assertion
    //   cy.contains('Required')
    //     .should('be.visible');

    //   cy.screenshot(
    //     'TC02-add-employee-negative'
    //   );

    //   logout();
    // });


    // -------------------------------------------------------
    // CREATE USER ACCOUNT - POSITIVE
    // -------------------------------------------------------

    it('TC03 - Positive: Admin berhasil membuat account untuk employee', () => {

      login(
        adminUsername,
        adminPassword
      );

      cy.contains('Admin')
        .click();

      cy.contains('User Management')
        .click();

      cy.contains('Users')
        .click();

      cy.contains('button', 'Add')
        .click();

      // User Role
      cy.get('.oxd-select-text')
        .eq(0)
        .click();

      cy.contains('ESS')
        .click();

      // Employee Name
      cy.get('input[placeholder="Type for hints..."]')
        .type(
          `${employee.firstName} ${employee.middleName} ${employee.lastName}`
        );

      cy.contains(
        `${employee.firstName} ${employee.middleName} ${employee.lastName}`
      )
        .click();

      // Username
      cy.contains('label', 'Username')
        .parent()
        .parent()
        .find('input')
        .type('admin')
        .type(employee.username);

      // Status
      cy.get('.oxd-select-text')
        .eq(1)
        .click();

      cy.contains('Enabled')
        .click();

      // Password
      cy.get('input[type="password"]')
        .eq(0)
        .type(employee.password);

      cy.get('input[type="password"]')
        .eq(1)
        .type(employee.password);

      // Save
      cy.contains('button', 'Save')
        .click();

      // Assertion
      cy.contains('Successfully Saved')
        .should('be.visible');

      cy.screenshot(
        'TC03-create-user-success'
      );

      logout();
    });


    // -------------------------------------------------------
    // CREATE USER ACCOUNT - NEGATIVE
    // -------------------------------------------------------

    it('TC04 - Negative: Tidak bisa membuat user dengan password berbeda', () => {

      login(
        adminUsername,
        adminPassword
      );

      cy.contains('Admin')
        .click();

      cy.contains('User Management')
        .click();

      cy.contains('Users')
        .click();

      cy.contains('button', 'Add')
        .click();

      // Password
      cy.get('input[type="password"]')
        .eq(0)
        .type('Password123!');

      cy.get('input[type="password"]')
        .eq(1)
        .type('WrongPassword123!');

      cy.contains('button', 'Save')
        .click();

      // Assertion
      cy.contains('Passwords do not match')
        .should('be.visible');

      cy.screenshot(
        'TC04-create-user-negative'
      );

      logout();
    });

  });


  // =========================================================
  // FLOW 2
  // MENAMBAHKAN JATAH CUTI
  // =========================================================

  describe('Flow 2 - Add Leave Entitlement', () => {

    // -------------------------------------------------------
    // POSITIVE CASE
    // -------------------------------------------------------

    it('TC05 - Positive: Admin berhasil memberikan jatah cuti', () => {

      login(
        adminUsername,
        adminPassword
      );

      cy.contains('Leave')
        .click();

      cy.contains('Entitlements')
        .click();

      cy.contains('Add Entitlements')
        .click();

      // Employee
      cy.get(
        'input[placeholder="Type for hints..."]'
      )
        .type(
          `${employee.firstName} ${employee.middleName} ${employee.lastName}`
        );

      cy.contains(
        `${employee.firstName} ${employee.middleName} ${employee.lastName}`
      )
        .click();

      // Leave Type
      cy.get('.oxd-select-text')
        .eq(0)
        .click();

      cy.contains('CAN - FMLA')
        .click();

      // Entitlement
      cy.get('input.oxd-input')
        .last()
        .type('5');

      cy.contains('button', 'Save')
        .click();

      // Confirmation dialog jika muncul
      cy.get('body').then(($body) => {

        if (
          $body.find(
            'button:contains("Confirm")'
          ).length > 0
        ) {
          cy.contains('button', 'Confirm')
            .click();
        }

      });

      cy.contains('Successfully Saved')
        .should('be.visible');

      cy.screenshot(
        'TC05-leave-entitlement-success'
      );

      logout();
    });


    // -------------------------------------------------------
    // NEGATIVE CASE
    // -------------------------------------------------------

    it('TC06 - Negative: Tidak bisa menyimpan entitlement tanpa jumlah hari', () => {

      login(
        adminUsername,
        adminPassword
      );

      cy.contains('Leave')
        .click();

      cy.contains('Entitlements')
        .click();

      cy.contains('Add Entitlements')
        .click();

      // Employee
      cy.get(
        'input[placeholder="Type for hints..."]'
      )
        .type(
          `${employee.firstName} ${employee.middleName} ${employee.lastName}`
        );

      cy.contains(
        `${employee.firstName} ${employee.middleName} ${employee.lastName}`
      )
        .click();

      // Jangan mengisi entitlement

      cy.contains('button', 'Save')
        .click();

      // Assertion
      cy.contains('Required')
        .should('be.visible');

      cy.screenshot(
        'TC06-leave-entitlement-negative'
      );

      logout();
    });

  });


  // =========================================================
  // FLOW 3
  // REQUEST CUTI
  // =========================================================

  describe('Flow 3 - Employee Request Leave', () => {

    // -------------------------------------------------------
    // POSITIVE
    // -------------------------------------------------------

    it('TC07 - Positive: Employee berhasil request cuti', () => {

      login(
        employee.username,
        employee.password
      );

      cy.contains('Leave')
        .click();

      cy.contains('Apply')
        .click();

      // Leave Type
      cy.get('.oxd-select-text')
        .click();

      cy.contains('CAN - FMLA')
        .click();

      // Date
      cy.get(
        'input[placeholder="yyyy-dd-mm"]'
      )
        .eq(0)
        .clear()
        .type('2026-09-15');

      cy.get(
        'input[placeholder="yyyy-dd-mm"]'
      )
        .eq(1)
        .clear()
        .type('2026-09-16');

      // Apply
      cy.contains('button', 'Apply')
        .click();

      // Assertion
      cy.contains('Successfully Saved')
        .should('be.visible');

      cy.screenshot(
        'TC07-request-leave-success'
      );

      logout();
    });


    // -------------------------------------------------------
    // NEGATIVE
    // -------------------------------------------------------

    it('TC08 - Negative: Employee tidak bisa request cuti tanpa Leave Type', () => {

      login(
        employee.username,
        employee.password
      );

      cy.contains('Leave')
        .click();

      cy.contains('Apply')
        .click();

      // Tidak memilih Leave Type

      cy.contains('button', 'Apply')
        .click();

      // Assertion
      cy.contains('Required')
        .should('be.visible');

      cy.screenshot(
        'TC08-request-leave-negative'
      );

      logout();
    });


    // =======================================================
    // APPROVE LEAVE
    // =======================================================

    it('TC09 - Positive: Admin berhasil approve request cuti', () => {

      login(
        adminUsername,
        adminPassword
      );

      cy.contains('Leave')
        .click();

      cy.contains('Leave List')
        .click();

      // Employee
      cy.get(
        'input[placeholder="Type for hints..."]'
      )
        .first()
        .type(
          `${employee.firstName} ${employee.middleName} ${employee.lastName}`
        );

      cy.contains(
        `${employee.firstName} ${employee.middleName} ${employee.lastName}`
      )
        .click();

      cy.contains('button', 'Search')
        .click();

      // Select leave request
      cy.get(
        'input[type="checkbox"]'
      )
        .eq(1)
        .check();

      // Approve
      cy.contains('button', 'Approve')
        .click();

      // Assertion
      cy.contains('Successfully Updated')
        .should('be.visible');

      cy.screenshot(
        'TC09-approve-leave-success'
      );

      logout();
    });


    // =======================================================
    // VERIFY APPROVED LEAVE
    // =======================================================

    it('TC10 - Positive: Employee melihat status cuti Approved', () => {

      login(
        employee.username,
        employee.password
      );

      cy.contains('Leave')
        .click();

      cy.contains('My Leave')
        .click();

      // Assertion
      cy.contains('Approved')
        .should('be.visible');

      cy.screenshot(
        'TC10-leave-approved'
      );
    });

  });

});
