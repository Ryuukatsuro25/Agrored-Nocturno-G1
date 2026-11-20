$TTL 86400
@   IN  SOA ns1.agrored.com. admin.agrored.com. (
        2026112001 3600 1800 604800 86400 )
@   IN  NS  ns1.agrored.com.
ns1 IN  A   172.16.1.198
www IN  A   172.16.1.199
intranet IN A 172.16.1.199
app     IN      A       172.16.1.199
