from common.scripts import utils

# Behaviour:
#     if given value (the col provided), process(given) is not empty
#     then:
#         if callback is a str or a number:
#             return callback
#         if callback is a function
#             execute it with value and
#             return the response


def if_valid(process, callback):
    def if_valid_func(value):
        if not utils.is_empty(process(value)):
            if callable(callback):
                return callback(value)
            else:
                return callback
        else:
            return ""

    return if_valid_func
