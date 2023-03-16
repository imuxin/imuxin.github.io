# Embed a Swimlanes.io diagram

## 2 steps to embed a swimlanes diagram

step1: to include swimlanes embed.js in your html

```js
<script src="//cdn.swimlanes.io/embed.js"></script>
```

step2: write your swimlanes diagram code

here is an example:
```xml
<swimlanes-io>
   title: {fal-box} Interops between Istiod and Sidecar
   //
   _: **1. initialization**
   apiserver <- istiod: observe the API Servers
   istiod <- sidecar: establishe a gRPC connection
   //
   //
   _: **2. xDS pushing**
   istiod -> sidecar: push xDS
   note:
   **xDS** protocol: In Envoy, the xDS protocol represents multiple discovery service protocols, including the Cluster Discovery Service (*CDS*), Listener Discovery Service (*LDS*), Route Discovery Service (*RDS*), Endpoint Discovery Service (*EDS*), and Secret Discovery Service (*SDS*).
</swimlanes-io>
```

the output:

<swimlanes-io>
   title: {fal-box} Interops between Istiod and Sidecar
   //
   _: **1. initialization**
   apiserver <- istiod: observe the API Servers
   istiod <- sidecar: establishe a gRPC connection
   //
   //
   _: **2. xDS pushing**
   istiod -> sidecar: push xDS
   note:
   **xDS** protocol: In Envoy, the xDS protocol represents multiple discovery service protocols, including the Cluster Discovery Service (*CDS*), Listener Discovery Service (*LDS*), Route Discovery Service (*RDS*), Endpoint Discovery Service (*EDS*), and Secret Discovery Service (*SDS*).
</swimlanes-io>

## Swimlanes.io full syntax overview

<swimlanes-io>
title: Swimlanes.io full syntax overview
//
//
_: **1. Messages**
One -> Two: Simple
Two ->> Three: Open arrow
Three -x Four: Lost message
//
Three <-> Four: Bi-directional
Two -> Two: To self
//
Two -> One: Actors can be
One <- Two: in any order
//
Two -> Three: Regular
Two <-- Three: Dashed
Two => Three: Bold
//
One -> Four: Markdown support for messages: *Italic*, **Bold**, ~~strike through~~ and `inline code`. + {fab-font-awesome} Icons
//
//
//
note: Add sequence numbers to messages with the _**autonumber**_ statement
//
// Uncomment next line for automatic message numbering
// autonumber
//
//
//
_: **2. Notes**
//
note:
Simple text formatting; **bold**, *italic*, ~~strike through~~ and `inline code`. + {fab-font-awesome} Icons
//
1. Ordered
2. list
//
//
* Unordered
* list
//
[link](http://www.swimlanes.io)
//
```
{
  code block..
}
```
//
Two -> Three: A note is closed by a following element
//
note: A note spans the length of the previoues message by default
//
note One, Three: Specify the start and end actor to change the width of a note
```
note [start[,end]]: text
```
//
_: **3. Sections**
//
if: Define conditional flows with _**if**_
  Two -> Three: Message
else: Optional alternative flow with _**else**_
  Two -> One: Message
else
  One <-> Four: Section lables are optional
  if: Sections can be nested one level
  end
    note One, Three: Sections are closed with the _**end**_ statement
end
//
group: _**group**_ can be used instead of _**if**_ for simple grouping
//
end
//
//
_: **4. Dividers**
//
_: thin
//
-: regular
//
--: dashed
//
=: bold
//
-: Markdown support for dividers: *Italic*, **Bold**, ~~strike through~~ and `inline code`. + {fab-font-awesome} Icons
//
_: **5. {fab-font-awesome fa-lg} Icons**
//
note: {far-bolt fa-lg} Font Awesome icons are supported using:
```
{fa$-icon}
```
Where **$** is:
- **b** for brand
- **s** for solid
- **r** for regular
- **l** for light
- **d** for duotone
//
See [Font Awesome overview](/gallery/font-awesome) for more details and [fontawesome.com](https://fontawesome.com/v5.10.1/icons?d=gallery) for a full list of available icons.
//
_: **6. Delay**
//
...: {fas-spinner} Indicate a delay in the flow
//
//
_: **7. Order**
note: Change the order of the actors with the _**order**_ statement
//
```
order: first [,second[,third ...]]
```
//
// Uncomment next line for re-ordering
// order: Three, Two
</swimlanes-io>


## References

1. https://swimlanes.io/
2. https://swimlanes.io/about/#/embed
