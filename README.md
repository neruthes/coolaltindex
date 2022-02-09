# CoolAltIndex

This is a Nodejs indexer for Nginx and [syscgijs](https://github.com/neruthes/syscgijs).

Alternatively, it may work with [nodecgid](https://github.com/neruthes/nodecgid).



## Request Headers

When passing from Nginx + nodecgid, you may specify the following request headers.

This section will be moved to a dedicated file if we have at least 6 available request headers.


### wwwroot

Use the `$document_root` variable in Nginx.

### wwwprefix

Optional. 

Suppose that you are `nas.alice.lan` and your file service is available at `http://nas.alice.lan/`.

Your friend `nas.bob.lan` wants to proxy your file service as `http://nas.bob.lan/friends/alice/`.

So that Bob must have `rewrite /friends/alice/(.*) /$1 break;` and `proxy_pass http://nas.alice.lan;`.

This will cause a problem. The navigation hierarchy will be wrong.

As a workaround, Bob must specify a `wwwprefix: friends/alice` header.


## Copyright

Copyright (c) 2022 Neruthes.

Published with GNU GPLv2.
