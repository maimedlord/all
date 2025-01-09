### tracking_v2
import json
import tv2_db
import tv2_utility
from tv2_config import http_500, http_204


from datetime import datetime #tracking
from flask import Flask, render_template, request, abort, redirect, send_file, session, url_for #tracking: abort, redirect, send_file, session, url_for
from flask_login import LoginManager, current_user, login_user, login_required, logout_user #tracking
from flask_session import Session #tracking
from functions import send_resume_email
import re #tracking
from urllib.parse import urlparse, urljoin #tracking
from werkzeug.security import generate_password_hash #tracking

import json #tracking

import os


app = Flask(__name__)
app.config.from_pyfile('tv2_config.py')

Session(app) #tracking

# rough #tracking
login_mgr = LoginManager() #tracking
login_mgr.init_app(app) #tracking
#login_mgr.login_message = '' #tracking
#login_mgr.login_view = '' #tracking


# for removing dangerous characters from strings passed to routes via POST/address #tracking
# def remove_danger_chars(passed_string): #tracking
#     return re.sub("[$;:&@?*%<>{}|,^]", '', passed_string) #tracking


@app.route('/')
def index():  # put application's code here
    return render_template('index.html')


# used for CA to validate that I own this website:
#@app.route('/.well-known/pki-validation/02EBC3B833B8B4D574FB89999EA5FDA4.txt')
#def http_ssl_cert_verify():
#    return '4CD980DC4E1EEE8705064EC32C6B06783F99E9CD04045959C44CC3F55B02A564\nsectigo.com'


@app.route('/art')
def art():
    return render_template('art.html')


@app.route('/art/fullsize/<art_name>', methods=['GET'])
def art_fullsize(art_name):
    return render_template('art_fullsize.html', art_name=art_name)


@app.route('/projects')
def projects():
    return render_template('projects.html')


@app.route('/resume_professional_skillset', methods=['GET', 'POST'])
def resume_professional_skillset():
    # process form for sending resume to user's email...
    if request.method == 'POST':
        func_return = send_resume_email(request.form['input_email'])
        print(func_return)

        # ses = boto3.client(
        #     'ses',
        #     region_name=SES_REGION_NAME,
        #     aws_access_key_id=AWS_ACCESS_KEY_ID,
        #     aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        # )
        # ses.send_email(
        #     Source='alex@alex-haas.com',
        #     Destination={'ToAddresses': email},
        #     Message={
        #         'Subject': {'Data': 'subject'},
        #         'Body': {
        #             'Text': {'Data': 'text'},
        #             'Html': {'Data': 'html'}
        #         }
        #     }
        # )
        print('end of current construction')

        message = 'The resume has been sent. Please check your junk email folder.'
        return render_template('resume_professional_skillset.html', message=message)
    return render_template('resume_professional_skillset.html')


@app.route('/tutorials')
def tutorials():
    return render_template('tutorials.html')


#testpu
@app.route('/test')
def test():
    return 'hello and stuff'


########################################################################################################################
# TRACKING_V2
# ...
@login_mgr.user_loader
def user_loader(user_id):
    return tv2_db.user_is_active_by_id(user_id)


# @app.route('/')
@app.route('/tv2_index')
def tv2_index():
    return render_template('tv2_index.html')


@app.route('/tv2_account')
@login_required
def tv2_account():
    return render_template('tv2_account.html', current_user_id=current_user.id_str)


@app.route('/tv2_error_page')
def tv2_error_page():
    return render_template('tv2_error_page.html')


@app.route('/tv2_login', methods=['GET', 'POST'])
def tv2_login():
    try:
        # logged-in users redirected to index
        if current_user.is_authenticated:
            return redirect('/tv2_index')
        # if user just created
        if 'message' in session.keys() and session['message'] is not None:
            usr_message = session['message']
            session['message'] = None # remove message from session as it has been received
            return render_template('tv2_login.html', usr_message=usr_message)
        # user tries logging in
        err_messages: list[str] = []
        if request.method == "POST":
            email: str = request.form['input_email']
            if not tv2_utility.validation_is_email(email):
                err_messages.append('The email you entered is invalid.')
            password = request.form['input_password']
            if not tv2_utility.validation_is_password(password):
                err_messages.append('The password you entered is invalid.')
            if not err_messages:
                response = tv2_db.user_authenticate(email, password)
                if response:
                    login_user(response) # login user
                    # NEED the entire following sequence needs to be fully understood:
                    next = request.args.get('next')
                    print('YOU NEED TO MAKE SURE THAT THIS LOGIN PROCEDURE IS SAFE: NEXT IS_SAFE_URL(NEXT)')
                    print(next)
                    if not tv2_utility.is_safe_url(next):
                        return abort(400)
                    return redirect(url_for('tv2_account'))
                err_messages.append('unable to log in with email/password combination. try again.')
        # if any errors in creating account redraw the page and inform user of errors
        if err_messages:
            return render_template('tv2_login.html', err_messages=err_messages)
        return render_template('tv2_login.html') # default render
    except Exception as e:
        print(str(e))
        tv2_utility.log_write(str(e))
        return redirect(url_for('tv2_error_page'))


@app.route('/tv2_logout')
@login_required
def tv2_logout():
    try:
        user_id: str = current_user.id_str
        logout_user()
        tv2_db.user_update_userLog(key=user_id, logCode=0, logMessage='used logged out', logTags=[
            'user',
            'logged-out',
            'user'
        ])
        return render_template('tv2_logout.html')
    except Exception as e:
        print(str(e))
        tv2_utility.log_write(str(e))
        return redirect(url_for('tv2_error_page'))


@app.route('/tv2_notes')
@login_required
def tv2_notes():
    return render_template('tv2_notes.html')


@app.route('/tv2_observables')
@login_required
def tv2_observables():
    return render_template('tv2_observables.html')


@app.route('/tv2_tasks')
@login_required
def tv2_tasks():
    return render_template('tv2_tasks.html')


@app.route('/tv2_user_create', methods=['GET', 'POST'])
def tv2_user_create():
    try:
        # logged-in users redirected to index
        if current_user.is_authenticated:
            return redirect('/tv2_index')
        # handle form submission
        err_messages: list[str] = []
        # user tries creating account
        if request.method == 'POST':
            email: str = request.form['input_user_email']
            if not tv2_utility.validation_is_email(email) or tv2_db.user_is_email_exists(email):
                err_messages.append('The email you entered already exists or is not a legitimate email.')
            username: str = request.form['input_user_username']
            if not tv2_utility.validation_is_username(username):
                err_messages.append(str(
                    'The username you entered is not valid. Usernames must start with an alpha or a number, '
                    'cannot contain any special characters and must be between 2 and 20 characters long.'
                ))
            password_1: str = request.form['input_user_password_1']
            password_2: str = request.form['input_user_password_2']
            if password_1 != password_2 or not tv2_utility.validation_is_password(password_1):
                err_messages.append(str(
                    'The passwords you entered do not match or are invalid. Passwords must contain one of '
                    'following special characters: @$!%*?&, must have at least one digit, one uppercase, '
                    'one lowercase character, and be between 12 or 32 characters long.'
                ))
            # create user
            if not err_messages:
                response = tv2_db.user_create(email, password_1, username)
                if response:
                    # session check in login page and message displayed if found
                    session['message'] = 'Your account was created successfully. Please login.'
                    return redirect('/tv2_login')
        # if any errors in creating account redraw the page and inform user of errors
        if err_messages:
            return render_template('tv2_user_create.html', err_messages=err_messages)
        return render_template('tv2_user_create.html') # default render
    except Exception as e:
        print(str(e))
        tv2_utility.log_write(str(e))
        return redirect(url_for('tv2_error_page'))


# API routes ##
@app.route('/tv2/api/note_create/<note_obj>')
@login_required
def tv2_api_note_create(note_obj):
    try:
        print('note_create: ' + note_obj)
        response = tv2_db.note_create(current_user.id_str, json.loads(note_obj))
        if response:
            print(response)
            return json.dumps({
                'status': 'success',
                'statusCode': 200,
                'data': []
            })
        return json.dumps(http_500)
    except Exception as e:
        print(str(e))
        tv2_utility.log_write(str(e))
        return json.dumps(http_500)


@app.route('/tv2/api/note_delete/<note_id>')
@login_required
def tv2_api_note_delete(note_id):
    try:
        response = tv2_db.note_delete(current_user.id_str, note_id)
        if response:
            print(response)
            return json.dumps({
                'status': 'success',
                'statusCode': 200,
                'data': []
            })
        return json.dumps(http_500)
    except Exception as e:
        print(str(e))
        tv2_utility.log_write(str(e))
        return json.dumps(http_500)


@app.route('/tv2/api/note_update/<note_obj>')
@login_required
def tv2_api_note_update(note_obj):
    try:
        response = tv2_db.note_update(current_user.id_str, json.loads(note_obj))
        if response:
            print(response)
            return json.dumps({
                'status': 'success',
                'statusCode': 200,
                'data': []
            })
    except Exception as e:
        print(str(e))
        tv2_utility.log_write(str(e))
        return json.dumps(http_500)


# confirmed working 24/11/13
@app.route('/tv2/api/notes_get_all')
@login_required
def tv2_api_notes_get_all():
    try:
        response = tv2_db.notes_get_all(current_user.id_str)
        # if other than None or empty list response has notes
        if response:
            response = tv2_utility.convert_datetimes_to_string(response) # convert datetime to string recursively
            response = tv2_utility.convert_objectids_to_string(response) # convert ObjectId to string recursively
            return json.dumps({
                'status': 'success',
                'statusCode': 200,
                'data': response
            })
        # handle empty list
        if isinstance(response, list):
            return json.dumps(http_204)
        # None indicates error
        return json.dumps(http_500)
    except Exception as e:
        print(str(e))
        tv2_utility.log_write(str(e))
        return json.dumps(http_500)

@app.route('/tv2/api/obs_create/<obs_obj>')
@login_required
def tv2_api_obs_create(obs_obj):
    try:
        print('obs_create: ' + obs_obj)
        response = tv2_db.obs_create(current_user.id_str, json.loads(obs_obj))
        if response:
            print(response)
            return json.dumps({
                'status': 'success',
                'statusCode': 200,
                'data': []
            })
        return json.dumps(http_500)
    except Exception as e:
        print(str(e))
        tv2_utility.log_write(str(e))
        return json.dumps(http_500)


@app.route('/tv2/api/obs_delete/<obs_id>')
@login_required
def tv2_api_obs_delete(obs_id):
    try:
        print('obs_delete: ' + obs_id)
        response = tv2_db.obs_delete(current_user.id_str, obs_id)
        if response:
            return json.dumps({
                'status': 'success',
                'statusCode': 200,
                'data': []
            })
        return json.dumps(http_500)
    except Exception as e:
        print(str(e))
        tv2_utility.log_write(str(e))
        return json.dumps(http_500)


@app.route('/tv2/api/observe_delete/<id_and_date_str>')
@login_required
def tv2_api_observe_delete(id_and_date_str):
    try:
        print('observe_delete: ' + id_and_date_str)
        response = tv2_db.obs_observe_delete(current_user.id_str, id_and_date_str)
        if response:
            print(response)
            return json.dumps({
                'status': 'success',
                'statusCode': 200,
                'data': []
            })
        return json.dumps(http_500)
    except Exception as e:
        print(str(e))
        tv2_utility.log_write(str(e))
        return json.dumps(http_500)


@app.route('/tv2/api/obs_observe/<obs_obj>')
@login_required
def tv2_api_obs_observe(obs_obj):
    try:
        print('obs_observe' + obs_obj)
        response = tv2_db.obs_observe(current_user.id_str, json.loads(obs_obj))
        if response:
            print(response)
            return json.dumps({
                'status': 'success',
                'statusCode': 200,
                'data': []
            })
        return json.dumps(http_500)
    except Exception as e:
        print(str(e))
        tv2_utility.log_write(str(e))
        return json.dumps(http_500)


@app.route('/tv2/api/obss_get_all')
@login_required
def tv2_api_obss_get_all():
    try:
        response = tv2_db.obss_get_all(current_user.id_str)
        # if other than None or empty list response has notes
        if response:
            response = tv2_utility.convert_datetimes_to_string(response) # convert datetime to string recursively
            response = tv2_utility.convert_objectids_to_string(response) # convert ObjectId to string recursively
            return json.dumps({
                'status': 'success',
                'statusCode': 200,
                'data': response
            })
        # handle empty list
        if isinstance(response, list):
            return json.dumps(http_204)
        # None indicates error
        return json.dumps(http_500)
    except Exception as e:
        print(str(e))
        tv2_utility.log_write(str(e))
        return json.dumps(http_500)


@app.route('/tv2/api/obs_rec_update/<obs_obj>')
@login_required
def tv2_api_obs_rec_update(obs_obj):
    try:
        print('obs_rec_update' + obs_obj)
        response = tv2_db.obs_rec_update(current_user.id_str, json.loads(obs_obj))
        if response:
            print(response)
            return json.dumps({
                'status': 'success',
                'statusCode': 200,
                'data': []
            })
        return json.dumps(http_500)
    except Exception as e:
        print(str(e))
        tv2_utility.log_write(str(e))
        return json.dumps(http_500)


@app.route('/tv2/api/obs_update/<obs_obj>')
@login_required
def tv2_api_obs_update(obs_obj):
    try:
        print('obs_update' + obs_obj)
        response = tv2_db.obs_update(current_user.id_str, json.loads(obs_obj))
        if response:
            print(response)
            return json.dumps({
                'status': 'success',
                'statusCode': 200,
                'data': []
            })
        return json.dumps(http_500)
    except Exception as e:
        print(str(e))
        tv2_utility.log_write(str(e))
        return json.dumps(http_500)


@app.route('/tv2/api/t_delete/<t_id>')
@login_required
def tv2_api_t_delete(t_id):
    try:
        response = tv2_db.t_delete(current_user.id_str, t_id)
        if response:
            return json.dumps({
                'status': 'success',
                'statusCode': 200,
                'data': []
            })
        return json.dumps(http_500)
    except Exception as e:
        print(str(e))
        tv2_utility.log_write(str(e))
        return json.dumps(http_500)


@app.route('/tv2/api/t_update/<t_obj>')
@login_required
def tv2_api_t_update(t_obj):
    try:
        response = tv2_db.t_update(current_user.id_str, json.loads(t_obj))
        if response:
            print(response)
            return json.dumps({
                'status': 'success',
                'statusCode': 200,
                'data': []
            })
        return json.dumps(http_500)
    except Exception as e:
        print(str(e))
        tv2_utility.log_write(str(e))
        return json.dumps(http_500)


@app.route('/tv2/api/task_create/<task_obj>')
@login_required
def tv2_api_task_create(task_obj):
    try:
        print('task_create: ' + task_obj)
        response = tv2_db.task_create(current_user.id_str, json.loads(task_obj))
        if response:
            print(response)
            return json.dumps({
                'status': 'success',
                'statusCode': 200,
                'data': []
            })
        return json.dumps(http_500)
    except Exception as e:
        print(str(e))
        tv2_utility.log_write(str(e))
        return json.dumps(http_500)


@app.route('/tv2/api/task_delete/<task_id>')
@login_required
def tv2_api_task_delete(task_id):
    try:
        response = tv2_db.task_delete(current_user.id_str, task_id)
        if response:
            print(response)
            return json.dumps({
                'status': 'success',
                'statusCode': 200,
                'data': []
            })
        return json.dumps(http_500)
    except Exception as e:
        print(str(e))
        tv2_utility.log_write(str(e))
        return json.dumps(http_500)

@app.route('/tv2/api/task_update/<task_obj>')
@login_required
def tv2_api_task_update(task_obj):
    try:
        response = tv2_db.task_update(current_user.id_str, json.loads(task_obj))
        if response:
            print(response)
            return json.dumps({
                'status': 'success',
                'statusCode': 200,
                'data': []
            })
        return json.dumps(http_500)
    except Exception as e:
        print(str(e))
        tv2_utility.log_write(str(e))
        return json.dumps(http_500)


@app.route('/tv2/api/tasks_get_all')
@login_required
def tv2_api_tasks_get_all():
    try:
        response = tv2_db.tasks_get_all(current_user.id_str)
        # if other than None or empty list response has notes
        if response:
            response = tv2_utility.convert_datetimes_to_string(response)  # convert datetime to string recursively
            response = tv2_utility.convert_objectids_to_string(response)  # convert ObjectId to string recursively
            return json.dumps({
                'status': 'success',
                'statusCode': 200,
                'data': response
            })
        # handle empty list
        if isinstance(response, list):
            return json.dumps(http_204)
        # None indicates error
        return json.dumps(http_500)
    except Exception as e:
        print(str(e))
        tv2_utility.log_write(str(e))
        return json.dumps(http_500)


@app.route('/tv2/api/view_get/<target>')
@login_required
def tv2_api_view_get(target):
    try:
        response = tv2_db.view_get(current_user.id_str, target)
        print(response)
        if response:
            response = response['view_configs'][target]
            return json.dumps({
                'status': 'success',
                'statusCode': 200,
                'data': response
            })
        return json.dumps(http_500)
    except Exception as e:
        print(str(e))
        tv2_utility.log_write(str(e))
        return json.dumps(http_500)


@app.route('/tv2/api/view_update/<view_obj>')
@login_required
def tv2_api_view_update(view_obj):
    try:
        print('api_view_update' + view_obj)
        response = tv2_db.view_update(current_user.id_str, json.loads(view_obj))
        if response:
            if response:
                print('api_view_update response' + str(response))
                return json.dumps({
                    'status': 'success',
                    'statusCode': 200,
                    'data': []
                })
        return json.dumps(http_500)
    except Exception as e:
        print(str(e))
        tv2_utility.log_write(str(e))
        return json.dumps(http_500)

# MAIN
