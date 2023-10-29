"use-strict";

(() => {
    $(document).ready(initialize);
    const stepperForm = $('#stepperForm')[0];
    const animatedNext = `<span>Next</span><i class="ms-2 fa fa-chevron-circle-right fa-beat"></i>`;
    const HANDLERS = {
        database: function (elem) {
            return true
            elem = $(elem);
            if (!hasData(elem)) return false;

            const data = serializeObject(elem);
            const mongodb = validateMongoUri(data.uri);
            if (!mongodb) {
                elem.find('[data-validation="uri"]').empty().append('Invalid MongoDB connection uri. Please re-try.').show();
                elem.find('[name="uri"]')[0].setCustomValidity(1);
                return false;
            }

            return true;
        },
        administratorAccount: function (elem) {
            elem = $(elem);
            if (!hasData(elem)) return false;
            const data = serializeObject(elem);

            if (!utilities.isValidEmail(data.email)) {
                elem.find('[data-validation="email"]').empty().append('Invalid email supplied. Please re-try.').show();
                elem.find('[name="email"]')[0].setCustomValidity(1);
                return false;
            }
            return true;
        }
    };

    function initialize() {
        var stepper = new Stepper(stepperForm);

        var stepperPanList = [].slice.call($(stepperForm).find('.bs-stepper-pane'));
        var form = $(stepperForm).find('.bs-stepper-content form');

        $('body').on('click', '.btn-next-form', function () {
            stepper.next();
        });

        stepperForm.addEventListener('show.bs-stepper', async function (event) {
            form.removeClass('was-validated');

            var nextStep = event.detail.indexStep;
            var currentStep = nextStep;

            if (currentStep > 0) {
                currentStep--;
            }

            var stepperPan = stepperPanList[currentStep];
            var {validator} = $(stepperPan).data();

            if (!HANDLERS[validator](stepperPan)) {
                event.preventDefault();
                form.addClass('was-validated');
            }
        });

        $('#connect-db').on('click', async function () {
            const btn = $(this);
            const currStep = btn.parent();
            var {validator} = $(currStep).data();

            if (btn.hasClass('btn-next-form'))  {
                return console.log('returned as it\'s validated');
            }

            form.removeClass('was-validated');

            if (!HANDLERS[validator](currStep)) {
                return form.addClass('was-validated');
            }

            btn.lockWithLoader('Saving');
            try {
                await callAjax('post', serializeObject(currStep), '/setup/api/database');
            } catch (err) {
                form.addClass('was-validated');
                currStep.find('[data-validation="uri"]').empty().append('Invalid MongoDB connection string. Please re-try.').show();
                currStep.find('[name="uri"]')[0].setCustomValidity(1);

            }
            
            setTimeout(() => {
                btn.unlockWithLoader(animatedNext);
                btn.addClass('btn-next-form');

                utilities.showToast('Database connection verified, please click next to continue.', 'success')
            }, 1000)
        });

        $('#create-admin-account').on('click', async function () {
            const btn = $(this);
            const currStep = btn.parent();
            var {validator} = $(currStep).data();

            if (btn.hasClass('btn-next-form')) return;
            form.removeClass('was-validated');

            if (!HANDLERS[validator](currStep)) {
                return form.addClass('was-validated');
            }

            btn.lockWithLoader('Saving');
            try {
                await callAjax('post', serializeObject(currStep), '/setup/api/account');
            } catch ({responseJSON, statusText}) {
                let message = statusText;
                let field = '';
                if (responseJSON && responseJSON.message) {
                    message = responseJSON.message;
                    field = responseJSON.field;
                }

                form.addClass('was-validated');

                if (!field) {
                    utilities.showToast('Some error occured while account creation.', 'error');
                    return btn.unlockWithLoader();
                }
                currStep.find(`[data-validation="${field}"]`).empty().append(message).show();
                currStep.find(`[name="${field}"]`)[0].setCustomValidity(1);
                return btn.unlockWithLoader();
            }
            
            setTimeout(() => {
                btn.unlockWithLoader(animatedNext);
                btn.addClass('btn-next-form');

                utilities.showToast('Account created! Please click next to continue.', 'success')
            }, 1000)
        });

        $('#finish-installation').on('click', async function () {
            let btn = $(this);
            btn.lockWithLoader('Please wait');
            try {
                await callAjax('post', {}, '/setup/api/complete');
                setTimeout(() => {
                    utilities.showToast('Node Blogger setup has been completed. Shutting down the web installer.', 'success');
                    btn.unlockWithLoader();
                    btn.attr('disabled', true);
                }, 800)

            } catch ({responseJSON, statusText}) {
                let message = statusText;
                if (responseJSON && responseJSON.message) {
                    message = responseJSON.message;
                }
                setTimeout(() => {
                    utilities.showToast(message, 'error');
                    btn.unlockWithLoader();
                }, 1000)
            }
        });
    }

    function serializeObject(elem) {
        let data = {};

        $.each($(elem).find('input,textarea'), function (i, e) {
            e = $(e);
            if (e.attr('name')) {
                data[e.attr('name')] = e.val();
            }
        });

        return data;
    }

    function hasData(elem) {
        let errors = 0;
        
        $.each(elem.find('input,textarea'), function (i, e) {
            if ($(e).attr('required')) {
                if (!$(e).val()) {
                    errors++;
                }
            }
        });

        return !Boolean(errors);
    }

    function validateMongoUri(uri) {
        const regex = /^(mongodb\+srv:\/\/)(.*?):(.*?)@(.*?)\/?$/;
        const match = uri.match(regex);

        if (match && match.length === 5) {
            const [, protocol, username, password, clusterAddress] = match;
            return {
                protocol,
                username,
                password,
                clusterAddress
            };
        } else {
            return null;
        }
    }

    function callAjax(method, payload, url) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url,
                method,
                contentType: 'application/json',
                data: JSON.stringify(payload),
                success: (data) => resolve(data),
                error: (err) => reject(err),
            });
        });
    }


})()