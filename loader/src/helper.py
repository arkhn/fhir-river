#!/usr/bin/env python


def get_topic_name(source, resource, task_type):
    """
    Generate topic name: `source-resource-task_type`
    :param source:
    :param resource:
    :param task_type: `extract` or `transform`
    :return:
    """
    return '-'.join([source, resource, task_type])
