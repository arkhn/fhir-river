import time
from functools import wraps

from prometheus_client import Histogram


class Timer:
    """
    Class to be used as a decorator to time functions and store observation in
    a Prometheus histogram.
    """
    def __init__(self, *args, **kwargs):
        """
        Takes the same arguments as prometheus_client.Histogram
        """
        self.histogram = Histogram(*args, **kwargs)

    def __call__(self, func, *args, **kwargs):
        @wraps(func)
        def timed(*args, **kwargs):
            ts = time.time()
            result = func(*args, **kwargs)
            self.histogram.observe(time.time() - ts)
            return result

        return timed
