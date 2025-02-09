import json
from copy import deepcopy

from bson.objectid import ObjectId
from datetime import datetime, timezone

from flask import Response
from pymongo import MongoClient

import tv2_utility # shrink what is accessed from this library
from tv2_user import User
from werkzeug.security import check_password_hash, generate_password_hash

# pymongo variables:
mongo_client = MongoClient()
db_notes = mongo_client['tv2_notes']
db_obss = mongo_client['tv2_obss']  # not in use yet
db_tasks = mongo_client['tv2_tasks']
db_users = mongo_client['tv2_users']
c_users = db_users['users']


# other variables:
noteLog_num_elements: int = 100
taskLog_num_elements: int = 100
userLog_num_elements: int = 100


# RETURN None if creating note fails || insert_one object if successful
def note_create(id_str: str, note_obj: dict):
    try:
        # first, prep insert object
        now_time = datetime.now(timezone.utc)
        note_obj['dateCreated'] = now_time
        note_obj['noteLog'] = [
            {
                'logDate': datetime.now(timezone.utc),
                'logCode': 0,
                'logMessage': 'note first created'
            }
        ]
        note_obj['tags'] = note_obj['tags'].split(',')
        # push to db
        collection = db_notes[id_str]
        response = collection.insert_one(note_obj)
        if response and response.acknowledged:
            return response
        raise Exception('unable to create note in database...')
    except Exception as e:
        print(str(e))
        tv2_utility.log_write(str(e))
        return None


# RETURN None if deleting note fails || delete_one object if successful
def note_delete(user_id_str: str, note_id_str: str):
    try:
        collection = db_notes[user_id_str]
        response = collection.delete_one({'_id': ObjectId(note_id_str)})
        if response and response.acknowledged:
            return response
        raise Exception('unable to delete note in database...')
    except Exception as e:
        print(str(e))
        tv2_utility.log_write(str(e))
        return None

# RETURN True if note updated || False if any errors encountered
# confirmed working 24/11/12
def note_update(user_id_str: str, note_obj: dict) -> bool:
    try:
        collection = db_notes[user_id_str]
        response = collection.update_one({'_id': ObjectId(note_obj['id'])}, {
            '$set': {
                'title': note_obj['title'],
                'color': note_obj['color'],
                'intensity': note_obj['intensity'],
                'location': note_obj['location'],
                'tags': note_obj['tags'],
                'text': note_obj['text']
            },
            '$push': {
                'noteLog': {
                    'logDate': datetime.now(timezone.utc),
                    'logCode': 0,
                    'logMessage': 'note updated'
                }
            }
        })
        # check if userLog updated
        if not response.acknowledged:
            raise Exception('Unable to update userLog with new logEvent')
        # check size of userLog and pop oldest element if too many elements
        response = collection.aggregate([
            {'$match': {'_id': ObjectId(note_obj['id'])}},
            {'$project': {'_id': 0, 'noteLog_size': {'$size': '$noteLog'}}}
        ])
        if response:
            response = list(response)
            if len(response) > 0 and response[0]['noteLog_size'] > noteLog_num_elements:
                response = collection.update_one({'_id': ObjectId(note_obj['id'])}, {'$pop': {'noteLog': -1}})
                if not response.acknowledged:
                    raise Exception('Unable to update noteLog by popping earliest logEvent')
        return True
    except Exception as e:
        print(str(e))
        tv2_utility.log_write(str(e))
        return False

# RETURN None if error or no docs || list of all docs if exist
# confirmed working 24/11/13
def notes_get_all(user_id_str: str):
    collection = db_notes[user_id_str]
    response = collection.find()
    if response:
        return list(response)
    return None

def obs_create(user_id_str: str, obs_obj: dict):
    try:
        # first, prep insert object
        now_time = datetime.now(timezone.utc)
        obs_obj['dateCreated'] = now_time
        obs_obj['obsLog'] = [
            {
                'logDate': datetime.now(timezone.utc),
                'logCode': 0,
                'logMessage': 'observable first created'
            }
        ]
        obs_obj['recordedObss'] = []
        obs_obj['tags'] = obs_obj['tags'].split(',')
        # push to db
        collection = db_obss[user_id_str]
        response = collection.insert_one(obs_obj)
        if response and response.acknowledged:
            return response
        raise Exception('unable to create observable in database...')
    except Exception as e:
        print(str(e))
        tv2_utility.log_write(str(e))
        return None

def obs_delete(user_id_str: str, obs_id_str: str):
    try:
        collection = db_obss[user_id_str]
        response = collection.delete_one({'_id': ObjectId(obs_id_str)})
        if response and response.acknowledged:
            return response
        raise Exception('unable to delete observable in database...')
    except Exception as e:
        print(str(e))
        tv2_utility.log_write(str(e))
        return None


# RETURN ???
def obss_get_all(user_id_str: str):
    collection = db_obss[user_id_str]
    response = collection.find()
    if response:
        return list(response)
    return None


# RETURN ???
def obs_observe(user_id_str: str, obs_obj: dict):
    try:
        print(obs_obj)
        collection = db_obss[user_id_str]
        # result = None
        result = collection.update_one({'_id': ObjectId(obs_obj['id'])}, {
            '$push': {'recordedObss': obs_obj }
        })
        if result.acknowledged:
            return result
        return None
    except Exception as e:
        print(str(e))
        tv2_utility.log_write(str(e))
        return None


# RETURN
# holy shit!
def obs_observe_delete(user_id_str: str, id_and_date_str: str):
    temp_array = id_and_date_str.split(',')
    collection = db_obss[user_id_str]
    result = collection.update_one({'_id': ObjectId(temp_array[0])}, {
        '$pull': {'recordedObss': {'dateCreated': temp_array[1]}}
    })
    if result.acknowledged:
        return result
    return None


# RETURNS
def obs_rec_update(user_id_str: str, obs_obj: dict):
    temp_date = obs_obj['originalDate']
    del obs_obj['originalDate'] # remove from dictionary as only needed for query
    collection = db_obss[user_id_str]
    result = collection.update_one({"_id": ObjectId(obs_obj['id'])},
                                   { "$set": { "recordedObss.$[elem]": obs_obj }},
                                   array_filters=[{"elem.dateCreated": temp_date}])
    if result.acknowledged and result.matched_count > 0:
        return result
    return None


# RETURNS
# NEED
def obs_update(user_id_str: str, obs_obj: dict):
    try:
        collection = db_obss[user_id_str]
        result = collection.update_one({'_id': ObjectId(obs_obj['_id'])}, {
            '$set': {
                'color': obs_obj['color'],
                'description': obs_obj['description'],
                'tags': obs_obj['tags'],
                'text': obs_obj['text'],
                'title': obs_obj['title']
            },
            '$push': {
                'obsLog': {
                    'logDate': datetime.now(timezone.utc),
                    'logCode': 0,
                    'logMessage': 'obs updated'
                }
            }
        })
        if result.acknowledged and result.matched_count > 0:
            return result
        return None
    except Exception as e:
        print(str(e))
        tv2_utility.log_write(str(e))
        return None

# RETURN None if deleting recordedTask fails || update_one object if successful
def t_delete(user_id_str: str, t_id_str: str):
    try:
        collection = db_tasks[user_id_str]
        id_parts_array = t_id_str.split(',')  # main_task_id,original_date_start,original_date_end
        recorded_tasks = "recordedTasks"
        # first, try to update recordedTask if it exists
        result = collection.update_one({'_id': ObjectId(id_parts_array[0])},{
            "$pull": {recorded_tasks: {"id": t_id_str}}
        })
        if result.acknowledged:
            return result
        return None
    except Exception as e:
        print(str(e))
        tv2_utility.log_write(str(e))
        return None


# RETURN None if updating recordedTask fails || update_one object if successful
# ChatGPT
def t_update(user_id_str: str, t_obj: dict):
    try:
        collection = db_tasks[user_id_str]
        id_parts_array = t_obj['id'].split(',')  # main_task_id,original_date_start,original_date_end
        recorded_tasks = "recordedTasks"
        # grab original id for querying db
        original_id: str = t_obj['id']
        # update recordedTask id before inserting it
        # swap out null with empty string
        if t_obj['dateEnd'] == None:
            t_obj['dateEnd'] = ''
        if t_obj['dateStart'] == None:
            t_obj['dateStart'] = ''
        t_obj['id'] = id_parts_array[0] + ',' + t_obj['dateStart'] + ',' + t_obj['dateEnd']
        # remove dates
        t_obj.pop('dateStart')
        t_obj.pop('dateEnd')
        # first, try to update recordedTask if it exists
        result = collection.update_one({
            "_id": ObjectId(id_parts_array[0]),  # Match the document
            f"{recorded_tasks}.id": original_id,  # Match the element in the array by 'id'
        },
            {
                "$set": {f"{recorded_tasks}.$": t_obj}  # Update the matched task
            }
        )
        # last, append new recordedTask if it is new
        if result.matched_count == 0:
            result = collection.update_one(
                {'_id': ObjectId(id_parts_array[0])},
                {"$addToSet": {recorded_tasks: t_obj}}
            )
        if result.matched_count > 0:
            return result
        return None
    except Exception as e:
        print(str(e))
        tv2_utility.log_write(str(e))
        return None


# RETURN None if creating task fails || insert_one object if successful
def task_create(id_str: str, task_obj: dict):
    try:
        # first, prep insert object
        now_time = datetime.now(timezone.utc)
        task_obj['dateCreated'] = now_time
        task_obj['recordedTasks'] = []
        task_obj['taskLog'] = [
            {
                'logDate': datetime.now(timezone.utc),
                'logCode': 0,
                'logMessage': 'task first created'
            }
        ]
        if task_obj['dateEnd']:
            task_obj['dateEnd'] = datetime.fromisoformat(task_obj['dateEnd'])
        if task_obj['dateStart']:
            task_obj['dateStart'] = datetime.fromisoformat(task_obj['dateStart'])
        if task_obj['guests']:
            task_obj['guests'] = task_obj['guests'].split(',')
        else:
            task_obj['guests'] = []
        if task_obj['tags']:
            task_obj['tags'] = task_obj['tags'].split(',')
        else:
            task_obj['tags'] = []
        if task_obj['priority'] == "":
            task_obj['priority'] = None
        else:
            task_obj['priority'] = int(task_obj['priority'])
        # alphabetize the object before inserting
        temp_dict = dict(sorted(task_obj.items()))
        # push to db
        collection = db_tasks[id_str]
        response = collection.insert_one(temp_dict)
        if response and response.acknowledged:
            return response
        raise Exception('unable to create note in database...')
        return True
    except Exception as e:
        print(str(e))
        tv2_utility.log_write(str(e))
        return None

# RETURN None if deleting task fails || delete_one object if successful
def task_delete(user_id_str: str, task_id_str: str):
    try:
        collection = db_tasks[user_id_str]
        response = collection.delete_one({'_id': ObjectId(task_id_str)})
        if response and response.acknowledged:
            return response
        raise Exception('unable to delete task in database...')
    except Exception as e:
        print(str(e))
        tv2_utility.log_write(str(e))
        return None

# RETURN True if task updated || False if any errors encountered
# confirmed working 24/11/12
def task_update(user_id_str: str, task_obj: dict) -> bool:
    try:
        if task_obj['dateEnd']:
            print(task_obj['dateEnd'])
            task_obj['dateEnd'] = datetime.fromisoformat(task_obj['dateEnd'])
            print('dateEnd after follows')
            print(task_obj['dateEnd'])
        if task_obj['dateStart']:
            task_obj['dateStart'] = datetime.fromisoformat(task_obj['dateStart'])
        if task_obj['guests']:
            task_obj['guests'] = task_obj['guests'].split(',')
        else:
            task_obj['guests'] = []
        if task_obj['tags']:
            task_obj['tags'] = task_obj['tags'].split(',')
        else:
            task_obj['tags'] = []
        # if task_obj['intensity'] == "":
        #     task_obj['intensity'] = None
        if task_obj['priority'] == "":
            task_obj['priority'] = None
        collection = db_tasks[user_id_str]
        response = collection.update_one({'_id': ObjectId(task_obj['id'])}, {
            '$set': {
                'color': task_obj['color'],
                'description': task_obj['description'],
                'dateEnd': task_obj['dateEnd'],
                'dateStart': task_obj['dateStart'],
                'guests': task_obj['guests'],
                # 'intensity': task_obj['intensity'],
                'location': task_obj['location'],
                'priority': task_obj['priority'],
                'repeat': task_obj['repeat'],
                'tags': task_obj['tags'],
                'text': task_obj['text'],
                'title': task_obj['title']
            },
            '$push': {
                'taskLog': {
                    'logDate': datetime.now(timezone.utc),
                    'logCode': 0,
                    'logMessage': 'task updated'
                }
            }
        })
        print(response)
        # check if userLog updated
        if not response.acknowledged:
            raise Exception('Unable to update userLog with new logEvent')
        # check size of userLog and pop oldest element if too many elements
        response = collection.aggregate([
            {'$match': {'_id': ObjectId(task_obj['id'])}},
            {'$project': {'_id': 0, 'taskLog_size': {'$size': '$taskLog'}}}
        ])
        if response:
            response = list(response)
            if len(response) > 0 and response[0]['taskLog_size'] > taskLog_num_elements:
                response = collection.update_one({'_id': ObjectId(task_obj['id'])}, {'$pop': {'taskLog': -1}})
                if not response.acknowledged:
                    raise Exception('Unable to update taskLog by popping earliest logEvent')
        return True
    except Exception as e:
        print(str(e))
        tv2_utility.log_write(str(e))
        return False


# RETURN None if error or no docs || list of all docs if exist
def tasks_get_all(user_id_str: str):
    collection = db_tasks[user_id_str]
    response = collection.find()
    if response:
        return list(response)
    return None


# RETURN None
# confirmed working 24/11/12
def user_update_userLog(key: str, logCode: int, logMessage: str, logTags: list[str]) -> None:
    try:
        key_type: str = ''
        if '@' in key:
            key_type = 'email'
        else:
            key_type = '_id'
            key = ObjectId(key)
        response = c_users.update_one({key_type: key}, {"$push": {"userLog": {
            'logCode': logCode,
            'logDate': datetime.now(timezone.utc),
            'logMessage': logMessage,
            'logTags': logTags,
        }}})
        # check if userLog updated
        if not response.acknowledged:
            raise Exception('Unable to update userLog with new logEvent')
        # check size of userLog and pop oldest element if too many elements
        response = list(c_users.aggregate([
            {'$match': {key_type: key}},
            {'$project': {'_id': 0, 'userLog_size': {'$size': '$userLog'}}}
        ]))
        if response and response[0]['userLog_size'] > userLog_num_elements:
            response = c_users.update_one({key_type: key}, {'$pop': {'userLog': -1}})
            if not response.acknowledged:
                raise Exception('Unable to update userLog by popping earliest logEvent')
        return None
    except Exception as e:
        print(str(e))
        tv2_utility.log_write(str(e))
        return None


# RETURN None if user not found || User object if found
def user_authenticate(email: str, password: str):
    try:
        response = c_users.find_one({'email': email}, {
            'active': 1,
            '_id': 1,
            'passwordHash': 1,
            'userName': 1
        })
        if response and response['active'] and check_password_hash(response['passwordHash'], password):
            # update user document userLog with logEvent for successful login
            user_update_userLog(
                email,
                logCode=0,
                logMessage='User logged in successfully',
                logTags=['account', 'logged-in', 'user']
            )
            return User(str(response['_id']), response['userName'])
        return response
    except Exception as e:
        print(str(e))
        tv2_utility.log_write(str(e))
        return None


# RETURN True if account created || False if otherwise
def user_create(email: str, password: str, username: str) -> bool:
    new_user_obj = {
        'active': True,
        'confirmed': False,
        'dateCreated': datetime.now(),
        'email': email,
        'passwordHash': generate_password_hash(password),
        'userLog': [{
            'logCode': 0,
            'logDate': datetime.now(timezone.utc),
            'logMessage': 'user account created for the first time',
            'logTags': ['account', 'create', 'user']
        }],
        'userName': username,
        'view_configs': {}
    }
    try:
        response = c_users.insert_one(new_user_obj)
        if response.acknowledged:
            return True
        return False
    except Exception as e:
        print(str(e))
        tv2_utility.log_write(str(e))
        return False


# RETURN None if no mapping || email string if mapping found
def user_logout_by_id(id_str):
    try:
        id_obj: ObjectId = ObjectId(id_str)
        response = c_users.find_one({'_id': id_obj}, {
            'email': 1,
        })
        if response and response['email']:
            return response['email']
        return None
    except Exception as e:
        print(str(e))
        tv2_utility.log_write(str(e))
        return None


# RETURN None || User class
def user_is_active_by_id(id_str):
    try:
        response = c_users.find_one({'_id': ObjectId(id_str)}, {
            'active': 1,
            'userName': 1
        })
        if not response or not response['active']:
            return None
        return User(id_str, response['userName'])
    except Exception as e:
        print(str(e))
        tv2_utility.log_write(str(e))
        return None


# RETURN True if email exists || False if email does not exist
def user_is_email_exists(email):
    try:
        response = c_users.find_one({'email': email})
        if response:
            return True
        return False
    except Exception as e:
        print(str(e))
        tv2_utility.log_write(str(e))
        return None


# RETURN ???
def view_get(id_str: str, target: str):
    try:
        response = c_users.find_one({'_id': ObjectId(id_str), str('view_configs' + '.' + target): {"$exists": True}}, {
            str('view_configs' + '.' + target): 1
        })
        print(response)
        return response
    except Exception as e:
        print(str(e))
        tv2_utility.log_write(str(e))
        return None

# RETURN ???
def view_update(id_str: str, view_obj):
    try:
        all_passed: bool = True
        for key in view_obj.keys():
            for key2 in view_obj[key].keys():
                # will create object with nested properties if need be: { view_configs: div_id: value }
                # if object exists will update property without affecting other properties
                response = c_users.update_one({'_id': ObjectId(id_str)}, {
                    "$set": { str('view_configs.' + key + '.' + key2): view_obj[key][key2] }
                })
                if not response.acknowledged:
                    all_passed = False
        return all_passed
    except Exception as e:
        print(str(e))
        tv2_utility.log_write(str(e))
        return False


# TESTING
if __name__ == '__main__':
    pass
