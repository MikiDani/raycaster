<?php

print "kint<br>";
if (isset($_POST['mapdata']))
{
    print "BENT !!! : )<br>";
    print "<pre>";
    print_r($_POST['mapdata']);
    print "</pre>";
}
?>
<script type="text/javascript">
    setTimeout(function(){
        window.close();
    }, 4000);
</script>