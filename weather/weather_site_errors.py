class BaseSiteException(Exception):
    pass


class PageError(BaseSiteException):
    pass


class UserRightError(BaseSiteException):
    pass


class ExternalServicesError(BaseSiteException):
    pass
