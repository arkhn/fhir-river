from functools import wraps

from prometheus_client import Counter as PromCounter, Histogram


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
            with self.histogram.time():
                return func(*args, **kwargs)

        return timed


class Counter:
    """
    Class to be used as a decorator to count how many time a function has been called and
    store this value in a Prometheus Counter.
    """

    def __init__(self, *args, **kwargs):
        """
        Takes the same arguments as prometheus_client.Counter
        """
        self.prom_counter = PromCounter(*args, **kwargs)

    def __call__(self, func, *args, **kwargs):
        @wraps(func)
        def counted(*args, **kwargs):
            self.prom_counter.inc()
            return func(*args, **kwargs)

        return counted


FAST_FN_BUCKETS = (0.0001, 0.0005, 0.001, 0.005, 0.01, 0.05, 0.1, 0.5)
